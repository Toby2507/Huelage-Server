import { Test, TestingModule } from '@nestjs/testing';
import { HuelagerResolver } from './huelager.resolver';
import { HuelagerService } from './huelager.service';
import { DeepMocked } from '@golevelup/ts-jest';
import { Huelager } from './entities/huelager.entity';
import { UpdatePhoneInput } from './dtos/update-phone.input';
import { VerifyPhoneInput } from './dtos/verify-phone.input';
import { VerifyEmailInput } from './dtos/verify-email.input';
import { ForgotPasswordInput } from './dtos/forgot-password.input';
import { UpdatePasswordInput } from './dtos/update-password.input';
import { RefreshTokenRequest } from '../../common/interfaces/request.interface';

const mockHuelagerService = () => ({
  refreshToken: jest.fn(),
  updatePhone: jest.fn(),
  verifyPhone: jest.fn(),
  requestEmailVerification: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  updatePassword: jest.fn(),
  generateRSAKey: jest.fn(),
});

describe('HuelagerResolver', () => {
  let resolver: HuelagerResolver;
  let service: DeepMocked<HuelagerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HuelagerResolver,
        { provide: HuelagerService, useFactory: mockHuelagerService },
      ],
    }).compile();

    resolver = module.get<HuelagerResolver>(HuelagerResolver);
    service = module.get(HuelagerService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('sayHello', () => {
    it('says hello', () => {
      expect(resolver.sayHello()).toStrictEqual('Hello World!');
    });
  });

  describe('refreshAccessToken', () => {
    const req = {
      user: {
        entityId: 'testId',
        refreshToken: 'testRefreshToken',
        iat: 123,
        exp: 123,
      },
    } as RefreshTokenRequest;

    const { entityId, refreshToken } = req.user;

    it('calls the refreshToken service; refreshes the access token and returns it.', async () => {
      service.refreshToken.mockResolvedValue('testToken');

      const result = await resolver.refreshAccessToken(req);

      expect(service.refreshToken).toHaveBeenCalledTimes(1);
      expect(service.refreshToken).toHaveBeenCalledWith({
        entityId,
        refreshToken,
      });
      expect(result).toStrictEqual('testToken');
    });
  });

  describe('updatePhone', () => {
    const huelager = new Huelager();
    const updatePhoneInput = new UpdatePhoneInput();

    it('calls the updatePhone service; updates the hulagers phone number and returns the huelager.', async () => {
      service.updatePhone.mockResolvedValue(huelager);

      const result = await resolver.updatePhone(updatePhoneInput);

      expect(service.updatePhone).toHaveBeenCalledTimes(1);
      expect(service.updatePhone).toHaveBeenCalledWith(updatePhoneInput);
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('verifyPhoneOtp', () => {
    const huelager = new Huelager();
    const verifyPhoneInput = new VerifyPhoneInput();

    it('calls the verifyPhone service; verifies the huelager otp and returns the huelager.', async () => {
      service.verifyPhone.mockResolvedValue(huelager);

      const result = await resolver.verifyPhoneOtp(verifyPhoneInput);

      expect(service.verifyPhone).toHaveBeenCalledTimes(1);
      expect(service.verifyPhone).toHaveBeenCalledWith(verifyPhoneInput);
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('requestEmailVerification', () => {
    const huelager = new Huelager();

    it('calls the requestEmailVerification service; requests the email verification and returns the huelager.', async () => {
      service.requestEmailVerification.mockResolvedValue(huelager);

      const result = await resolver.requestEmailVerification('testEmail');

      expect(service.requestEmailVerification).toHaveBeenCalledTimes(1);
      expect(service.requestEmailVerification).toHaveBeenCalledWith(
        'testEmail',
      );
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('verifyEmailOtp', () => {
    const huelager = new Huelager();
    const verifyEmailInput = new VerifyEmailInput();

    it('calls the verifyEmail service; verifies the huelager email and returns the huelager.', async () => {
      service.verifyEmail.mockResolvedValue(huelager);

      const result = await resolver.verifyEmailOtp(verifyEmailInput);

      expect(service.verifyEmail).toHaveBeenCalledTimes(1);
      expect(service.verifyEmail).toHaveBeenCalledWith(verifyEmailInput);
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('forgotPassword', () => {
    const huelager = new Huelager();
    const forgotPasswordInput = new ForgotPasswordInput();

    it('calls the forgotPassword service; updates the password and returns the huelager.', async () => {
      service.forgotPassword.mockResolvedValue(huelager);

      const result = await resolver.forgotPassword(forgotPasswordInput);

      expect(service.forgotPassword).toHaveBeenCalledTimes(1);
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotPasswordInput);
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('updatePassword', () => {
    const huelager = new Huelager();
    const updatePasswordInput = new UpdatePasswordInput();

    it('calls the updatePassword service; updates the password and returns the huelager.', async () => {
      service.updatePassword.mockResolvedValue(huelager);

      const result = await resolver.updatePassword(updatePasswordInput);

      expect(service.updatePassword).toHaveBeenCalledTimes(1);
      expect(service.updatePassword).toHaveBeenCalledWith(updatePasswordInput);
      expect(result).toStrictEqual(huelager);
    });
  });

  describe('generateRSAKey', () => {
    const huelager = new Huelager();

    it('calls the generateRSAKey service; generate the an RSA key pair and returns the public key.', async () => {
      service.generateRSAKey.mockResolvedValue('publicKey');

      const result = await resolver.generateRSAKey({ user: huelager });

      expect(service.generateRSAKey).toHaveBeenCalledTimes(1);
      expect(service.generateRSAKey).toHaveBeenCalledWith(huelager);
      expect(result).toStrictEqual('publicKey');
    });
  });
});
