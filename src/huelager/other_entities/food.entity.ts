import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

enum Availability {
  AVAILABLE = 'available',
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
  UNAVAILABLE = 'unavailable',
}

enum FoodCategory {
  SNACKS = 'snacks',
  DRINKS = 'drinks',
  PROTEIN = 'protein',
  CARBOHYDRATE = 'carbohydrate',
}

enum FoodPricing {
  PRICE = 'price',
  PORTION = 'portion',
  PACKAGE = 'package',
  FIXED = 'fixed',
}

registerEnumType(Availability, { name: 'Availability' });
registerEnumType(FoodCategory, { name: 'FoodCategory' });

@Entity({ name: 'food' })
@ObjectType()
export class Food {
  @PrimaryColumn({ type: 'uuid', name: 'product_id' })
  productId: string;

  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column({ type: 'enum', enum: FoodCategory })
  @Field(() => FoodCategory)
  category: FoodCategory;

  @Column({ type: 'enum', enum: FoodPricing, name: 'pricing_method' })
  @Field(() => FoodPricing)
  pricingMethod: FoodPricing;

  @Column({ name: 'portion_price', type: 'decimal', nullable: true })
  @Field({ nullable: true })
  portionPrice: number;

  @Column({ name: 'min_price', type: 'decimal', nullable: true })
  @Field({ nullable: true })
  minPrice: number;

  @Column({ name: 'fixed_price', type: 'decimal', nullable: true })
  @Field({ nullable: true })
  fixedPrice: number;

  @Column({ type: 'enum', enum: Availability, default: Availability.AVAILABLE })
  @Field(() => Availability)
  availability: Availability;

  @Column({ name: 'package_sizes', type: 'json', nullable: true })
  @Field({ nullable: true })
  packagesSizes: object;

  @Column({ type: 'json', nullable: true })
  @Field({ nullable: true })
  sides: object;
}