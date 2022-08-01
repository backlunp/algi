var credentials = require("../../credentials");

import { Order, OrderSide, OrderType } from "../../entity/order.entity";
import { CONFIG } from "../../config";
import { delay } from "../../common";
import { IBroker } from "..";
import { User } from "../../entity/user.entity";
import { Position } from "../../strategy-manager";

interface RobinhoodOrderResponse {
  id: string;
  state: string; // replace with enum
  average_price: string;
  executed_notional: {
    amount: string;
  };
}

interface RobinhoodQuote {
  ask_price: string;
  ask_size: number;
  bid_price: string;
  bid_size: number;
  last_trade_price: string;
  last_extended_hours_trade_price: string;
  previous_close: string;
  adjusted_previous_close: string;
  previous_close_date: string;
  symbol: string;
  trading_halted: boolean;
  has_traded: boolean;
  last_trade_price_source: string;
  updated_at: string;
  instrument: string;
  instrument_id: string;
}

export class RobinhoodAPI implements IBroker {
  robinhood: any;

  constructor() {
    // var Robinhood = {};
    console.log("creating new Robinhood API");
  }

  async init() {
    this.robinhood = await this.getCreds().catch(console.error);
    console.log("Successfully signed in to RobinHood");
    return true;
  }

  getCreds() {
    return new Promise((resolve, reject) => {
      var Robinhood = require("robinhood")(
        credentials.credentials.robinhood,
        function (err: any, data: any) {
          //Robinhood is connected and you may begin sending commands to the api.
          if (err) {
            console.log("err", err);
            reject(err);
          }
          resolve(Robinhood);
        }
      );
    });
  }

  getCurrentPositions() {
    return new Promise<Position[]>((resolve, reject) => {
      this.robinhood.nonzero_positions(function (
        err: any,
        response: any,
        body: { results: unknown }
      ) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          //console.log("positions");
          //console.log(body);
          let positions = body.results;
          if (!positions) {
            resolve([]);
          }
          resolve(positions as Position[]);
        }
      });
    });
  }

  async getQuote(symbol: string) {
    return new Promise<RobinhoodQuote>((resolve, reject) => {
      this.robinhood.quote_data(
        symbol,
        function (
          err: any,
          response: any,
          body: { results: (RobinhoodQuote | PromiseLike<RobinhoodQuote>)[] }
        ) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("quote_data: ", symbol);
            //console.log(body);
            resolve(body.results[0]);
          }
        }
      );
    });
  }

  async getPrice(symbol: string) {
    const quote: RobinhoodQuote = await this.getQuote(symbol);
    return quote.last_trade_price;
  }

  async getInstrumentData(instrumentUrl: string) {
    return await fetch(instrumentUrl).then((response: { json: () => any }) =>
      response.json()
    );
  }

  async getAccountInfo() {
    return new Promise((resolve, reject) => {
      this.robinhood.accounts(function (
        err: any,
        response: any,
        body: { results: unknown[] }
      ) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("accounts");
          resolve(body.results[0]);
        }
      });
    });
  }

  async submitOrder(order: Order): Promise<RobinhoodOrderResponse> {
    // // Optional:
    // trigger: String, // Defaults to "gfd" (Good For Day)
    // time: String,    // Defaults to "immediate"
    // type: String     // Defaults to "market"

    let { symbol, orderType, quantity, price } = order;
    // get the quote and instrument data;
    const quote: RobinhoodQuote = await this.getQuote(symbol);
    const instrument = await this.getInstrumentData(quote.instrument);

    // TODO: Confirm we need to check the price here for market orders
    if (orderType == OrderType.market || !price) {
      //TODO: "Prices above $1.00 can't have subpenny increments"
      // Check if the price is > 1 before using toFixed
      price = parseFloat(quote.last_trade_price).toFixed(2);
      console.log(`${order.orderSide} ${symbol} x${quantity} $${price} `);
    }
    var options = {
      quantity,
      instrument,
      type: orderType,
      ask_price: price,
      bid_price: price,
    };

    let orderFunc: string = "";
    if (order.orderSide == OrderSide.buy) orderFunc = "place_buy_order";
    else if (order.orderSide == OrderSide.sell) orderFunc = "place_sell_order";

    if (!orderFunc) {
      throw "No OrderSide provided.";
    }

    return new Promise((resolve, reject) => {
      this.robinhood[orderFunc](
        options,
        function (err: any, response: any, body: RobinhoodOrderResponse) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("OrderFunc", orderFunc);
            resolve(body);
          }
        }
      );
    });
  }

  async cancelOrder(orderId: string): Promise<RobinhoodOrderResponse> {
    return new Promise((resolve, reject) => {
      this.robinhood.cancel_order(
        orderId,
        function (err: any, response: any, body: RobinhoodOrderResponse) {
          if (err) {
            reject(err);
          } else {
            //console.log("Order Status");
            resolve(body);
          }
        }
      );
    });
  }

  async getOrderStatusById(orderId: string): Promise<RobinhoodOrderResponse> {
    return new Promise((resolve, reject) => {
      this.robinhood.orders(
        orderId,
        function (err: any, response: any, body: RobinhoodOrderResponse) {
          if (err) {
            reject(err);
          } else {
            //console.log("Order Status");
            resolve(body);
          }
        }
      );
    });
  }

  async submitAndAwaitOrder(order: Order) {
    //console.log("submit and await", this);
    return new Promise<Order>(async (resolve, reject) => {
      let orderStatus: void | RobinhoodOrderResponse = await this.submitOrder(
        order
      ).catch(console.error);

      if (!orderStatus) {
        console.error(order.symbol + "failed: ", orderStatus);
        reject(new Error("Order failed: "));
        return;
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
        resolve({
          ...order,
          executedAveragePrice: orderStatus.average_price,
        } as Order);
      } else {
        await this.cancelOrder(orderStatus.id);
        reject(new Error(`${order.symbol}: ${orderStatus}`));
      }
    });
  }
}

//module.exports = { RobinhoodAPI, OrderType, Order };
