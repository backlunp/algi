import { getRepository } from "typeorm";
import { AlpacaAPI } from "../brokers";
import { Strategy } from "../entity/strategy.entity";
import { SupportedBroker } from "../entity/supported-broker.entity";
import { User } from "../entity/user.entity";

export async function registerUsers() {
  let user = {
    userName: "peter",
  };
  const userRepository = getRepository(User);
  const userExists = await userRepository.findOne(user);
  if (userExists) {
    return;
  }

  await userRepository.save(user);
}

export async function registerBrokers() {
  let brokers = [
    {
      displayName: "Alpaca",
      className: "AlpacaAPI",
    },
  ];

  await brokers.forEach(async (broker) => {
    let repository = getRepository(SupportedBroker);
    const itemExists = await repository.findOne({
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
  let curUser = await getRepository(User).findOne();
  let alpaca = await getRepository(SupportedBroker).findOne({
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

  let strategyRepository = getRepository(Strategy);

  strategies.forEach(async (strategyToCheck) => {
    // Get our strategy entity from storage or create
    const strategy: Strategy | undefined = await strategyRepository.findOne({
      displayName: strategyToCheck.displayName,
    });
    if (strategy != undefined) return strategy;

    const newStrategy: Strategy = strategyToCheck;

    // Create a new one
    await strategyRepository.save(newStrategy);
    return newStrategy;
  });
}
