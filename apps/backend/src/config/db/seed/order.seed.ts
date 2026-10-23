import { type PrismaTx } from "@common/database";
import { type Order, type User } from "../generated/client";

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

export async function orderSeed(tx: PrismaTx, customers: User[]) {
  for (const order of orders) {
    await tx.order.upsert({
      where: { id: order.id },
      update: {},
      create: order,
    });

    for (const customer of customers) {
      await tx.customerOrder.upsert({
        where: { customerId_orderId: { customerId: customer.id, orderId: order.id } },
        update: {},
        create: {
          customerId: customer.id,
          orderId: order.id,
          totalAmount: Math.random(),
        },
      });
    }
  }

  await tx.$executeRaw`SELECT setval(pg_get_serial_sequence('"order"', 'id'), (SELECT MAX(id) FROM "order"))`;
}
