import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from "typeorm";
import { Strategy } from "./strategy.entity";
import { SupportedBroker } from "./supported-broker.entity";

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

  @Column({ nullable: true })
  price?: string;

  @Column({ type: "timestamp", nullable: true })
  timestamp?: Date;

  @Column({ nullable: true })
  averageExecutedPrice?: string;

  @Column({ nullable: true })
  executedNotional?: string;

  @ManyToOne(() => SupportedBroker, (supportedBroker) => supportedBroker.orders)
  supportedBroker: SupportedBroker;

  @ManyToOne((type) => Strategy, (strategy) => strategy.orders)
  strategy: string;
}
