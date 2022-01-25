import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum OrderType {
  market = "market",
  limit = "limit",
}

export enum OrderSide {
  sell = "sell",
  buy = "buy",
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  symbol: string;

  @Column({
    type: "enum",
    enum: OrderType,
    default: OrderType.market,
  })
  orderType: OrderType;

  @Column({
    type: "enum",
    enum: OrderSide,
  })
  orderSide: OrderSide;

  @Column()
  quantity: number;

  @Column()
  price?: string;

  @Column()
  timestamp?: Date;

  @Column()
  averageExecutedPrice?: string;

  @Column()
  executedNotional?: string;
}
