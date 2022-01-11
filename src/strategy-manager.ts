// let RobinhoodAPI = require("./broker");
import { RobinhoodAPI } from "./brokers";
import { Order } from "./entity/order.entity";
import { OrderDataBase, OpenPosition } from "./db";
import fs from "fs";
/**
 * @description
 * Defines a new strategy manager. This will act as the wrapper around the broker
 * as well as the database layer.
 */

export enum Brokerage {
  robinhood = "robinhood",
}

export interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
}

// defines our strategies configuration information
export interface Configuration {
  strategyId: string;
  brokerage: any;
}

export class StrategyManager {
  strategyId: string;
  broker: any;
  orderDb: OrderDataBase;
  openPositions: Position[];
  strategyPositionValue: number;
  strategyCashValue: number;

  constructor(config: Configuration) {
    this.strategyId = config.strategyId;
    this.broker = new config.brokerage();
    this.orderDb = new OrderDataBase(config.strategyId);
  }

  async init() {
    await this.broker.init();
  }

  async refreshStrategyStats() {
    this.openPositions = await this.allOpenPositions();
    this.strategyPositionValue = await this.sumPositionValue(
      this.openPositions
    );
    // TODO: get cash position
  }

  async executeOrder(orders: Order[]) {
    //console.log(this.broker.submitOrder);
    // Create the order in the broker
    let self = this;
    // We have to do this instead of passing the function directly
    // or it creates a new closure for some reason.
    let settledOrders = await Promise.allSettled(
      orders.map(async (order) => self.broker.submitAndAwaitOrder(order))
    );

    console.log("Settled Orders");
    console.table(settledOrders);

    let successfulOrderPromises = settledOrders.filter(
      (res) => res.status === "fulfilled"
    ) as PromiseFulfilledResult<any>[];

    console.log("Successful Orders");
    console.table(successfulOrderPromises);

    let successfulOrders: Order[] = successfulOrderPromises.map(
      (order) => order.value
    );
    // Save the order in the database
    // get our sample orders
    console.log("writing orders", successfulOrders);
    this.orderDb.writeOrders(successfulOrders);
    //console.log(this.orderDb.findOrdersBySymbol("SOXL"));
  }

  async getQuote(symbol: String) {
    const price = await this.broker.getPrice(symbol);
    return price;
  }

  async allOpenPositions() {
    // Read all open positions from our DB
    // console.log(this.orderDb.calculateNonZeroPositions());

    const openPositions: OpenPosition[] =
      await this.orderDb.calculateNonZeroPositions();

    // Get the current value of our open positions
    const settledPositionsPromises = await Promise.allSettled(
      openPositions.map(async (position) => {
        const currentPrice = parseFloat(await this.getQuote(position.symbol));
        const value = position.quantity * currentPrice;
        return {
          ...position,
          currentPrice,
          value,
        };
      })
    );

    const successfulPositionsPromiseResults = settledPositionsPromises.filter(
      (res) => res.status === "fulfilled"
    ) as PromiseFulfilledResult<any>[];

    const successfullPositions: Position[] =
      successfulPositionsPromiseResults.map((position) => position.value);

    return successfullPositions;
    // Confirm with broker
  }

  async sumPositionValue(positions: Position[]) {
    return positions.reduce((prev: number, cur: Position) => {
      if (cur.value) {
        return prev + cur.value;
      }
      throw new Error("No price info provided for " + cur.symbol);
      return prev;
    }, 0);
  }
}
