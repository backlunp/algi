import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../../entity/user.entity";

@Entity()
export class AlpacaCredentials {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  keyId: string;

  // TODO: Use crypto
  @Column()
  secretKey: string;
}
