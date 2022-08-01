import "reflect-metadata";
import { AppDataSource } from "./data-source";

import { registerStrategies } from "./datastore/seed-data";
import { Strategy } from "./entity/strategy.entity";
import { StrategyManager } from "./strategy-manager";

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    execute();
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
// import fs from "fs";

async function execute() {
  // Get all our active strategies
  let strategyRepo = AppDataSource.getRepository(Strategy);
  let strategies: Strategy[] = await strategyRepo.find({
    relations: ["supportedBroker", "user"],
  });
  strategies.forEach(async (strategy) => {
    const strategyManager = new StrategyManager(strategy);
    await strategyManager.init();
    // const sampleOrders: Order[] = JSON.parse(
    //   fs.readFileSync("./etc/sample-orders.json", "utf-8")
    // );
    // console.table(sampleOrders);
    // strategyManager.executeOrder(sampleOrders);
    // Start with our open positions
    // const openPositions: OpenPosition[] =
    //   await strategyManager.allOpenPositions();
    // console.log(openPositions);
  });
  // const strategyValue = "";
}

async function seedData() {
  // await registerUsers();
  // await registerBrokers();
  await registerStrategies();
}
//seedData();
//execute();
