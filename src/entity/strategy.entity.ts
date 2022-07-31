import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { SupportedBroker } from "./supported-broker.entity";
import { User } from "./user.entity";

@Entity()
export class Strategy {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  displayName: string;

  @ManyToOne(() => User, (user) => user.strategies)
  user: User;

  @ManyToOne(
    () => SupportedBroker,
    (supportedBroker) => supportedBroker.strategies
  )
  supportedBroker: SupportedBroker;

  @Column()
  fileLoc: string;

  @OneToMany((type) => Order, (order) => order.strategy, { nullable: true })
  orders?: Order[];
}
