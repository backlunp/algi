import { credentials } from "../credentials";
// const fetch = require("node-fetch");
const Alpaca = require("@alpacahq/alpaca-trade-api");

import { Position } from "../strategy-manager";
import { Order, OrderSide, OrderType } from "../entity/order.entity";
import { IBroker } from ".";
import { User } from "../entity/user.entity";

export class AlpacaAPI implements IBroker {
  alpaca: any;

  async init(user: User) {
    return new Promise<boolean>((resolve) => {
      this.alpaca = new Alpaca({
        keyId: credentials.alpaca.keyId,
        secretKey: credentials.alpaca.secretKey,
        paper: true,
      });
      resolve(true);
    });
  }

  async getCurrentPositions() {}

  async getPrice(symbol: Symbol) {
    try {
      const resp = await this.alpaca.getBars("minute", symbol, {
        limit: 1,
      });
      return resp.closePrice;
    } catch (e) {
      console.log("Error getting price", e);
    }
  }

  async submitOrder(order: Order) {
    return new Promise(async (resolve, reject) => {
      try {
        let orderResponse = await this.alpaca.createOrder({
          symbol: order.symbol,
          qty: order.quantity,
          side: order.orderSide,
          type: "market",
          time_in_force: "day",
        });
        console.log(
          `Market order of | ${order.quantity} ${order.symbol} ${order.orderSide} | completed.`
        );
        console.log(orderResponse);
        resolve(true);
      } catch (err) {
        console.log(
          `Order of |  ${order.quantity} ${order.symbol} ${order.orderSide} | did not go through.`
        );
        resolve(false);
      }
    });
  }

  async submitAndAwaitOrder(order: Order) {
    return new Promise(async (resolve, reject) => {});
  }
}
