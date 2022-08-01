import { AlpacaAPI, RegisteredBroker } from "../brokers";
import { AppDataSource } from "../data-source";
import { Strategy } from "../entity/strategy.entity";
import { SupportedBroker } from "../entity/supported-broker.entity";
import { User } from "../entity/user.entity";

export async function registerUsers() {
  console.log("Registering Users");
  let user = {
    userName: "peter",
  };
  const userRepository = AppDataSource.getRepository(User);
  const userExists = await userRepository.findOneBy(user);
  if (userExists) {
    return;
  }

  await userRepository.save(user);
}

export async function registerBrokers() {
  console.log("Registering Brokers");
  let brokers = [
    {
      displayName: "Alpaca",
      className: "AlpacaAPI" as RegisteredBroker,
    },
  ];

  await brokers.forEach(async (broker) => {
    let repository = AppDataSource.getRepository(SupportedBroker);
    const itemExists = await repository.findOneBy({
      displayName: broker.displayName,
    });
    if (itemExists) {
      return;
    }

    await repository.save(broker);
  });
}

// Quick and dirty, register all strategies in the DB
export async function registerStrategies() {
  console.log("Registering Strategies");
  let curUser = await AppDataSource.getRepository(User).findOneBy({
    userName: "peter",
  });
  let alpaca = await AppDataSource.getRepository(SupportedBroker).findOneBy({
    displayName: "Alpaca",
  });

  if (!curUser || !alpaca) {
    return;
  }

  let strategies: Strategy[] = [
    {
      user: curUser,
      displayName: "first-strat",
      supportedBroker: alpaca,
      fileLoc: "./files/first-strat.ts",
    },
  ];

  let strategyRepository = AppDataSource.getRepository(Strategy);

  strategies.forEach(async (strategy) => {
    // Get our strategy entity from storage or create
    const extantStrategy: Strategy | null = await strategyRepository.findOneBy({
      displayName: strategy.displayName,
    });
    if (extantStrategy) return extantStrategy;

    // Create a new one
    await strategyRepository.save(strategy);
    return strategy;
  });
}
