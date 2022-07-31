import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { IBroker } from "../brokers";
import { Order } from "./order.entity";
import { Strategy } from "./strategy.entity";

@Entity()
export class SupportedBroker {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  displayName: string;

  @Column()
  className: string;

  @OneToMany(() => Strategy, (strategy) => strategy.supportedBroker)
  strategies: Strategy[];

  @OneToMany(() => Order, (order) => order.supportedBroker)
  orders: Order[];
}
