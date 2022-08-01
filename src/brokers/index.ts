import { Order } from "../entity/order.entity";
import { User } from "../entity/user.entity";
import { Position } from "../strategy-manager";
import { AlpacaAPI } from "./alpaca/alpaca";
import { RobinhoodAPI } from "./robinhood/robinhood";

export * from "./robinhood/robinhood";

export * from "./alpaca/alpaca";

export interface IBrokerConstructor {
  new (user: User): IBroker;
}

// TODO: Fix commented methods
export interface IBroker {
  init: () => Promise<boolean>;
  getCurrentPositions: () => Promise<Position[]>;
  getPrice: (symbol: string) => Promise<string>;
  submitAndAwaitOrder: (order: Order) => Promise<Order | Error>;
}

// TODO: There has got to be a better way to do this.
export const RegisteredBrokers = {
  AlpacaAPI: AlpacaAPI,
  RobinhoodAPI: RobinhoodAPI,
};

export type RegisteredBroker = keyof typeof RegisteredBrokers;
