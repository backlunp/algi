import { credentials } from "../../credentials";
const Alpaca = require("@alpacahq/alpaca-trade-api");

import { Position } from "../../strategy-manager";
import { Order, OrderSide, OrderType } from "../../entity/order.entity";
import { IBroker } from "..";
import { User } from "../../entity/user.entity";
import { AlpacaCredentials } from "./entity/alpaca-creds.entity";
import { CONFIG } from "../../config";
import { delay } from "../../common";
import { AppDataSource } from "../../data-source";

interface AlpacaOrderResponse {
  id: string;
  state: string; // replace with enum
  average_price: string;
  executed_notional: {
    amount: string;
  };
}

export class AlpacaAPI implements IBroker {
  _user: User;
  alpaca: any;

  constructor(user: User) {
    this._user = user;
  }
  async init() {
    // Get our credentials
    var userCredentials = await AppDataSource.getRepository(
      AlpacaCredentials
    ).findOneBy({
      user: this._user,
    });

    if (!userCredentials) {
      console.warn(`Can't find user credentials: ${this._user.userName}`);
      return false;
    }

    this.alpaca = new Alpaca({
      keyId: userCredentials.keyId,
      secretKey: userCredentials.secretKey,
      paper: true,
    });

    return true;
  }

  async getCurrentPositions() {
    var myPositions = await this.alpaca.getPositions();
    return myPositions;
  }

  async getPrice(symbol: string) {
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
    return new Promise<AlpacaOrderResponse>(async (resolve, reject) => {
      try {
        let orderResponse = await this.alpaca.createOrder({
          symbol: order.symbol,
          qty: order.quantity,
          side: order.orderSide,
          type: "market",
          time_in_force: "day",
        });
        console.log(
          `Market order of | ${order.quantity} ${order.symbol} ${order.orderSide} | submitted.`
        );
        console.log(orderResponse);
        resolve(orderResponse);
      } catch (err) {
        let errMessage = new Error(
          `Order of |  ${order.quantity} ${order.symbol} ${order.orderSide} | did not go through.`
        );
        console.error(errMessage);
        reject(errMessage);
      }
    });
  }

  async cancelOrder(orderId: string) {
    return await this.alpaca.cancelOrder(orderId);
  }
  async getOrderStatusById(orderId: string): Promise<AlpacaOrderResponse> {
    return await this.alpaca.getOrder(orderId);
  }

  async submitAndAwaitOrder(order: Order) {
    let orderStatus: AlpacaOrderResponse = await this.submitOrder(order).catch(
      (err) => {
        console.error(err);
        return err;
      }
    );

    if (!orderStatus) {
      console.error(order.symbol + "failed: ", orderStatus);
      return new Error("Order failed: ");
    }

    let period = 500;
    const mult = 1.5;
    // let orderStatus: RobinhoodOrderResponse = await this.orderStatus(orderResponse.id);
    //
    console.log("OrderStatus " + order.symbol, orderStatus);
    // Wait for our order to fill, or our waiting period to hit 5 minutes
    while (
      ["unconfirmed", "queued", "confirmed"].includes(orderStatus.state) &&
      period <= CONFIG.ORDER_TIMEOUT
    ) {
      console.log(`Checking Status - ${order.symbol}: `, period);
      await delay(period); // TODO: Make this
      orderStatus = await this.getOrderStatusById(orderStatus.id);
      //console.log(orderStatus);
      period = period * mult;
    }
    console.log(order.symbol, orderStatus.state);
    if (orderStatus.state == "filled") {
      return {
        ...order,
        executedAveragePrice: orderStatus.average_price,
      } as Order;
    } else {
      await this.cancelOrder(orderStatus.id);
      return new Error(`${order.symbol}: ${orderStatus}`);
    }
  }
}
