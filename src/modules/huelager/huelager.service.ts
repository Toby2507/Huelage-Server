import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateKeyPairSync } from 'crypto';

import { JwtService } from '@nestjs/jwt';

import { RefreshTokenDto } from './dtos/refresh-token.input';
import { compare, hash } from 'bcryptjs';
import { Huelager, HuelagerType } from './entities/huelager.entity';
import { HuelagerRepository } from './huelager.repository';
import { UpdatePhoneInput } from './dtos/update-phone.input';
import { genRandomOtp, otpIsExpired } from '../../common/helpers/helpers';
import { SmsService } from '../../providers/sms.service';
import { VerifyPhoneInput } from './dtos/verify-phone.input';
import { EmailService } from '../../providers/email.service';
import { VerifyEmailInput } from './dtos/verify-email.input';
import { ForgotPasswordInput } from './dtos/forgot-password.input';
import { UpdatePasswordInput } from './dtos/update-password.input';
import { env } from '../../config/env.config';
import { UpdateWalletPinInput } from './dtos/update-wallet-pin.input';
import { VerifyWalletPinInput } from './dtos/verify-wallet-pin.input';
import { AccountDetailInput } from './dtos/account-details.input';

@Injectable()
export class HuelagerService {
  constructor(
    private readonly repository: HuelagerRepository,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  async getTokens(entityId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          entityId,
        },
        {
          secret: env.jwt_access_secret,
          expiresIn: '3d',
        },
      ),
      this.jwtService.signAsync(
        {
          entityId,
        },
        {
          secret: env.jwt_refresh_secret,
          expiresIn: '1y',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { entityId, refreshToken } = refreshTokenDto;

    const huelager = await this.repository.findHuelager({
      where: { entityId },
    });
    if (!huelager) throw new UnauthorizedException();

    const matches = await compare(refreshToken, huelager.hashedRefreshToken);
    if (!matches) throw new UnauthorizedException();

    return await this.jwtService.signAsync(
      { entityId },
      { secret: env.jwt_access_secret, expiresIn: '3d' },
    );
  }
  async updatePhone(updatePhoneInput: UpdatePhoneInput): Promise<Huelager> {
    const { entityId, phone } = updatePhoneInput;

    const possibleHuelagers = await this.repository.findHuelagers({
      where: [{ entityId }, { phone }],
    });
    const huelager = possibleHuelagers.find(
      (huelager) => huelager.entityId === entityId,
    );
    if (!huelager) throw new NotFoundException('No user with this id exists');
    /**
     * Make sure the chosen phone number does not already exist.
     * Even if it does, it should be this user that owns it.
     * i.e, they can 'change' their phone number to the same thing
     */
    if (possibleHuelagers.length > 1)
      throw new ConflictException(`Phone number already in use.`);

    const otp = genRandomOtp();
    huelager.phone = phone;
    huelager.otp = otp;
    huelager.isPhoneVerified = false;

    const name =
      huelager.entityType === HuelagerType.USER
        ? huelager.user.firstName
        : huelager.vendor.businessName;

    await this.repository.saveHuelager(huelager);

    this.smsService.sendSms(
      huelager.phone,
      `Hi, ${name}Welcome to huelage  here is your OTP: ${otp} `,
    );
    return huelager;
  }

  async verifyPhone(verifyPhoneInput: VerifyPhoneInput): Promise<Huelager> {
    const { phone, otp } = verifyPhoneInput;

    const huelager = await this.repository.findHuelager({ where: { phone } });
    if (!huelager)
      throw new NotFoundException('No user with this phone number exists');

    const isExpired = otpIsExpired(huelager.updatedAt);
    const notMatch = huelager.otp !== otp;

    if (isExpired || notMatch)
      throw new UnauthorizedException('The otp is invalid');

    const { accessToken, refreshToken } = await this.getTokens(
      huelager.entityId,
    );

    huelager.accessToken = accessToken;
    huelager.refreshToken = refreshToken;
    huelager.isPhoneVerified = true;
    huelager.hashedRefreshToken = await hash(refreshToken, 10);
    await this.repository.saveHuelager(huelager);

    return huelager;
  }

  async requestEmailVerification(email: string): Promise<Huelager> {
    const huelager = await this.repository.findHuelager({ where: { email } });

    if (!huelager)
      throw new NotFoundException('No user with this email exists');

    const otp = genRandomOtp();

    huelager.otp = otp;
    await this.repository.saveHuelager(huelager);

    const name =
      huelager.entityType === HuelagerType.USER
        ? huelager.user.firstName
        : huelager.vendor.businessName;
    this.emailService.sendOtpToEmail({ to: email, name, otp });

    return huelager;
  }

  async verifyEmail(verifyEmailInput: VerifyEmailInput): Promise<Huelager> {
    const { email, otp } = verifyEmailInput;

    const huelager = await this.repository.findHuelager({ where: { email } });
    if (!huelager)
      throw new NotFoundException('No user with this phone number exists');

    const isExpired = otpIsExpired(huelager.updatedAt);
    const notMatch = huelager.otp !== otp;

    if (isExpired || notMatch)
      throw new UnauthorizedException('The otp is invalid');

    huelager.isEmailVerified = true;
    await this.repository.saveHuelager(huelager);

    return huelager;
  }

  async forgotPassword(
    forgotPasswordInput: ForgotPasswordInput,
  ): Promise<Huelager> {
    const { entityId, password } = forgotPasswordInput;

    const huelager = await this.repository.findHuelager({
      where: { entityId },
    });

    if (!huelager) throw new NotFoundException();

    const hashedPassword = await hash(password, 10);
    huelager.password = hashedPassword;

    this.repository.saveHuelager(huelager);

    return huelager;
  }

  async updatePassword(
    updatePasswordInput: UpdatePasswordInput,
  ): Promise<Huelager> {
    const { entityId, oldPassword, password } = updatePasswordInput;

    const huelager = await this.repository.findHuelager({
      where: { entityId },
    });

    if (!huelager) throw new NotFoundException();

    const matches = await compare(oldPassword, huelager.password);

    if (!matches) throw new UnauthorizedException();

    huelager.password = await hash(password, 10);
    this.repository.saveHuelager(huelager);

    return huelager;
  }

  async generateRSAKey(huelager: Huelager) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 512,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    await this.repository.addBiometrics({
      huelager,
      key: privateKey,
    });

    return publicKey;
  }

  async huelagerFromAccountNumber({
    accountNumber,
    walletId,
  }: AccountDetailInput) {
    if (!walletId && !accountNumber)
      throw new BadRequestException(
        'walletId and accountNumber cannot both be null',
      );

    const searchField = accountNumber ? { accountNumber } : { walletId };

    const huelager = await this.repository.findHuelager({
      where: { wallet: searchField },
    });

    if (!huelager) throw new NotFoundException('Invalid account number.');

    return huelager;
  }

  async verifySubscriber(connectionParams: any) {
    const authorization = connectionParams.Authorization;

    if (!authorization) throw new Error('Not authorized.');

    const token = authorization.replace('Bearer ', '');

    if (!token) throw new Error('Not authorized.');

    const { entityId } = (await this.jwtService.decode(token)) as {
      entityId: string;
    };

    const huelager = await this.repository.findHuelager({
      where: { entityId },
    });

    if (!huelager) {
      throw new UnauthorizedException();
    }

    return { entityId, walletId: huelager.wallet.walletId };
  }

  async updateWalletPin(
    updateWalletPinInput: UpdateWalletPinInput,
  ): Promise<Huelager> {
    const { pin, huelager } = updateWalletPinInput;

    huelager.wallet.walletPin = await hash(pin, 10);
    this.repository.saveWallet(huelager.wallet);

    return huelager;
  }

  async verifyWalletPin(
    verifyWalletPinInput: VerifyWalletPinInput,
  ): Promise<boolean> {
    const { pin, huelager } = verifyWalletPinInput;

    const matches = await compare(pin, huelager.wallet.walletPin);

    return matches;
  }
}
