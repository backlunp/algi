import { StrategyManager, Configuration, Brokerage } from "./strategy-manager";
import "reflect-metadata";
import { RobinhoodAPI } from "./brokers";
import { Order } from "./entity/order.entity";
import { OpenPosition } from "./db";

import fs from "fs";

let config: Configuration = {
  strategyId: "first-strat",
  brokerage: RobinhoodAPI,
};

let targetPortfolio = [
  { symbol: "SOXL", percentage: 0.5 },
  { symbol: "SPY", percentage: 0.25 },
  { symbol: "XLK", percentage: 0.25 },
  { symbol: "GME", quantity: 1 },
  { symbol: "MSFT", quantity: 11 },
];

async function execute() {
  const strategyManager = new StrategyManager(config);
  await strategyManager.init();
  // const sampleOrders: Order[] = JSON.parse(
  //   fs.readFileSync("./etc/sample-orders.json", "utf-8")
  // );
  // console.table(sampleOrders);
  // strategyManager.executeOrder(sampleOrders);

  // Start with our open positions
  const openPositions: OpenPosition[] =
    await strategyManager.allOpenPositions();

  console.table(openPositions);

  const strategyValue = "";
}

execute();
