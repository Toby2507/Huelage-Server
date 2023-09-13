import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Vendor } from './vendor/vendor.entity';
import { VendorService } from './vendor/vendor.service';
import { VendorResolver } from './vendor/vendor.resolver';
import { SmsService } from '../utils/sms.service';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { UserResolver } from './user/user.resolver';
import { HuelagerRepository } from './huelager.repository';
import { HuelagerService } from './hulager.service';
import { RefreshTokenStrategy } from './auth/strategies/refresh-token.strategy';
import { AccessTokenStrategy } from './auth/strategies/access-token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { Huelager } from './entities/huelager.entity';
import { Wallet } from './entities/huenit_wallet.entity';
import { Biometric } from './entities/biometric.entity';
import { Review } from './entities/review.entity';
import { Food } from '../huelager/other_entities/food.entity';
import { Product } from '../huelager/other_entities/product.entity';
import { Transaction } from '../huelager/other_entities/transaction.entity';
import { WalletTransaction } from '../huelager/other_entities/wallet_transaction.entity';
import { Order } from '../huelager/other_entities/order/order.entity';
import { OrderItem } from '../huelager/other_entities/order/order_item.entity';
import { CanceledOrder } from '../huelager/other_entities/order/canceled_order.entity';
import { HuelagerResolver } from '../huelager/huelager.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      User,
      Huelager,
      Wallet,
      Biometric,
      Review,
      Food,
      Product,
      Transaction,
      WalletTransaction,
      Order,
      OrderItem,
      CanceledOrder,
    ]),
    JwtModule.register({}),
  ],
  providers: [
    VendorService,
    VendorResolver,
    SmsService,
    UserService,
    UserResolver,
    HuelagerRepository,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    HuelagerService,
    HuelagerResolver,
  ],
})
export class HuelagersModule {}

// @Global()
// @Module({
//   imports: [JwtModule.register({}), TypeOrmModule.forFeature([Vendor, User])],
//   providers: [AccessTokenStrategy, RefreshTokenStrategy, HuelagerService],
//   exports: [HuelagerService],
// })
// export class AuthModule {}
