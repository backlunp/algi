import fs from "fs";
import { Connection, createConnection, getRepository } from "typeorm";
import { Order, OrderSide } from "../entity/order.entity";

export interface OpenPosition {
  symbol: string;
  quantity: number;
  currentPrice?: number;
  value?: number;
}

/*
TODO: Order Stack: for each security, we should calculate the accrual based
on a stack. i.e. if I buy 10 shares, then immediately sell them, those orders
wouldn't impact the long term gain from that security.
*/

export class OrderDataBase {
  strategyId: string;
  orderFile: string;
  _connection: any;
  _orderRepository: any;

  constructor(strategyId: string) {
    this.strategyId = strategyId;
    this.orderFile = `./db/${this.strategyId}-orders.json`;
  }

  async init() {
    await createConnection();
    this._orderRepository = getRepository(Order);
  }

  getAllOrders() {
    let fileContents: string = fs.readFileSync(this.orderFile, "utf-8");
    //console.log("file contents", fileContents);
    let allOrders: Order[] = fileContents ? JSON.parse(fileContents) : [];
    return allOrders;
  }

  async writeOrders(orders: Order[]) {
    await this._orderRepository.save(orders);
  }

  findOrdersBySymbol(symbol: string) {
    let allOrders: Order[] = this.getAllOrders();
    return allOrders.filter((order) => order.symbol == symbol);
  }

  calculateNonZeroPositions() {
    console.log("Finding nonzero orders");
    let allOrders: Order[] = this.getAllOrders();
    let ordersSymbolMap: { [key: string]: Order[] } = {};
    allOrders.map((order) => {
      if (!ordersSymbolMap[order.symbol]) {
        ordersSymbolMap[order.symbol] = [];
      }
      ordersSymbolMap[order.symbol].push(order);
    });

    let openOrdersArr: OpenPosition[] = [];

    // Iterate through and find the non-zero positions
    Object.keys(ordersSymbolMap).forEach((symbol) => {
      let symOrders: Order[] = ordersSymbolMap[symbol];
      let symCnt = symOrders.reduce(function (orderCnt, curOrder) {
        let multiplier = curOrder.orderSide == OrderSide.buy ? 1 : -1;
        console.log(symbol, multiplier);
        return orderCnt + curOrder.quantity * multiplier;
      }, 0);
      if (symCnt) {
        openOrdersArr.push({ symbol, quantity: symCnt });
      }
    });
    return openOrdersArr;
  }
}
