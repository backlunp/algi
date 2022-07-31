// import { StrategyManager } from "./strategy-manager";
import "reflect-metadata";
import { createConnection } from "typeorm";

// import { OpenPosition } from "./datastore";
// import { getRepository } from "typeorm";
// import { Strategy } from "./entity/strategy.entity";
import {
  registerBrokers,
  registerStrategies,
  registerUsers,
} from "./datastore/seed-data";

// import fs from "fs";

async function execute() {
  // Get all our active strategies
  // let strategies: Strategy[] = await getRepository(Strategy).find();
  // strategies.forEach(async (strategy) => {
  //   const strategyManager = new StrategyManager(strategy);
  //   await strategyManager.init();
  //   // const sampleOrders: Order[] = JSON.parse(
  //   //   fs.readFileSync("./etc/sample-orders.json", "utf-8")
  //   // );
  //   // console.table(sampleOrders);
  //   // strategyManager.executeOrder(sampleOrders);
  //   // Start with our open positions
  //   // const openPositions: OpenPosition[] =
  //   //   await strategyManager.allOpenPositions();
  //   // console.log(openPositions);
  // });
  // const strategyValue = "";
}

async function seedData() {
  await createConnection();
  await registerUsers();
  await registerBrokers();
  await registerStrategies();
}

seedData();
