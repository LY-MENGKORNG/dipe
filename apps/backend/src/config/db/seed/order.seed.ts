import { type PrismaTx } from "@common/database";
import { type Order } from "../generated/client";
import { users } from "./user.seed";

export const orders: Order[] = [
  {
    id: 1,
    status: "pending",
  },
  {
    id: 2,
    status: "accepted",
  },
  {
    id: 3,
    status: "cancelled",
  },
  {
    id: 4,
    status: "pendingPayment",
  },
];

export async function orderSeed(tx: PrismaTx) {
  for (const order of orders) {
    const ord = await tx.order.upsert({
      where: order,
      update: order,
      create: order,
    });

    for (const user of users) {
      await tx.customerOrder.create({
        data: {
          customerId: user.id,
          orderId: ord.id,
          totalAmount: Math.random(),
        },
      });
    }
  }
}
