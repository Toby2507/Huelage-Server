import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Huelager } from '../entities/huelager.entity';
import { Review } from '../entities/review.entity';
import { Order } from '../other_entities/order/order.entity';
// import { v4 } from 'uuid';

@Entity({ name: 'user' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'entity_id' })
  entityId: string;

  @OneToOne(() => Huelager, (huelager) => huelager.user, {
    cascade: true,
  })
  @Field(() => Huelager)
  @JoinColumn({ name: 'entity_id' })
  entity: Huelager;

  @Column({ name: 'first_name', type: 'varchar', length: 30 })
  @Field()
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 30 })
  @Field()
  lastName: string;

  // @Column({ name: 'delivery_addr', type: 'text' })
  // @Field()
  // deliveryAddress: string;

  @Column({ name: 'is_social_auth', type: 'boolean', default: false })
  @Field()
  isSocialAuth: boolean;

  @OneToMany(() => Review, (review) => review.user)
  @Field(() => Review)
  review: Review;

  @OneToMany(() => Order, (order) => order.user)
  @Field(() => Order)
  order: Order;
}
