import { StrategyManager } from "../../strategy-manager";
import "reflect-metadata";
import { AlpacaAPI, RobinhoodAPI } from "../../brokers";
import { Order } from "../../entity/order.entity";
import { OpenPosition } from "../../datastore";
import { Strategy } from "../../entity/strategy.entity";

// import fs from "fs";

export default function TestStrategy() {
  let targetPortfolio = [
    { symbol: "SOXL", percentage: 0.5 },
    { symbol: "SPY", percentage: 0.25 },
    { symbol: "XLK", percentage: 0.25 },
    { symbol: "GME", quantity: 1 },
    { symbol: "MSFT", quantity: 11 },
  ];

  async function execute(strategyManager: StrategyManager) {
    // const sampleOrders: Order[] = JSON.parse(
    //   fs.readFileSync("./etc/sample-orders.json", "utf-8")
    // );
    // console.table(sampleOrders);
    // strategyManager.executeOrder(sampleOrders);

    // Start with our open positions
    const openPositions: OpenPosition[] =
      await strategyManager.allOpenPositions();

    console.log(openPositions);

    const strategyValue = "";
  }

  return {
    execute,
  };
}
