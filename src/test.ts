import { OrderDataBase } from "./db";
import fs from "fs";
import { Order } from "./entity/order.entity";

async function database() {
  const orderDb = new OrderDataBase("tests");
  await orderDb.init();
  const sampleOrders: Order[] = JSON.parse(
    fs.readFileSync("./etc/sample-orders.json", "utf-8")
  );
  await orderDb.writeOrders(sampleOrders);
}

database();
