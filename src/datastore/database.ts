import { OpenPosition } from ".";
import { AppDataSource } from "../data-source";
import { Order, OrderSide } from "../entity/order.entity";
import { Strategy } from "../entity/strategy.entity";

/*
TODO: Order Stack: for each security, we should calculate the accrual based
on a stack. i.e. if I buy 10 shares, then immediately sell them, those orders
wouldn't impact the long term gain from that security.
*/

export class OrderDataBase {
  _strategy: Strategy;
  // orderFile: string;
  _connection: any;
  _orderRepository: any;
  // _strategy: any;

  constructor(strategy: Strategy) {
    this._strategy = strategy;
    this._orderRepository = AppDataSource.getRepository(Order);
    // this.orderFile = `./db/${this.strategyId}-orders.json`;
  }

  async init() {
    console.log("initiating db");
    // this._strategy = strategy;
  }

  getAllOrders() {
    return this._orderRepository.find({ strategy: this._strategy });
  }

  async writeOrders(orders: Order[]) {
    console.log("writing orders");
    await this._orderRepository.save(orders);
    return;
  }

  findOrdersBySymbol(symbol: string) {
    console.log("Finding: " + symbol);
    return this._orderRepository.find({
      where: { strategy: this._strategy, symbol },
    });
  }

  calculateNonZeroPositions(strategy: Strategy | null = null) {
    console.log("Finding nonzero orders");
    let allOrders: Order[] = this.getAllOrders();

    let ordersSymbolMap: { [key: string]: Order[] } = {};
    console.log(allOrders);
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
