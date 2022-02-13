import { OrderDataBase } from "./db";
import fs from "fs";
import { Order } from "./entity/order.entity";

async function database() {
  const orderDb = new OrderDataBase("tests");
  await orderDb.init();
  const sampleOrders: Order[] = JSON.parse(
    fs.readFileSync("./etc/sample-orders.json", "utf-8")
  );
  //await orderDb.writeOrders(sampleOrders);
  const orders = await orderDb.findOrdersBySymbol("MSFT");
  console.table(orders);
}

database();

// const TestFactory = () => {
//   const testVar1 = 1;
//   const testVar2 = 2;

//   function testFunc() {
//     console.log(testVar1 + testVar2);
//   }

//   return {
//     testFunc,
//     testVar1,
//   };
// };

// const TestFactory2 = () => {
//   return {
//     new: TestFactory()
//   }
// }
