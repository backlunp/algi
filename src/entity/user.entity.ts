import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Strategy } from "./strategy.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column()
  userName: string;

  @OneToMany(() => Strategy, (strategy) => strategy.user)
  strategies: Strategy;
}
