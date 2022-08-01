import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { IBroker, RegisteredBroker } from "../brokers";
import { Order } from "./order.entity";
import { Strategy } from "./strategy.entity";

@Entity()
export class SupportedBroker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  displayName: string;

  @Column()
  className: RegisteredBroker;

  @OneToMany(() => Strategy, (strategy) => strategy.supportedBroker)
  strategies: Strategy[];

  @OneToMany(() => Order, (order) => order.supportedBroker)
  orders: Order[];
}
