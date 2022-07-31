import { Order } from "../entity/order.entity";
import { User } from "../entity/user.entity";
import { Position } from "../strategy-manager";

export * from "./robinhood";

export * from "./alpaca";

// TODO: Fix commented methods
export interface IBroker {
  init: (user: User) => Promise<boolean>;
  // getCurrentPositions: () => Promise<Position[]>;
  getPrice: (symbol: Symbol) => Promise<String>;
  // submitAndAwaitOrder: (order: Order) => Promise<Order>;
}
