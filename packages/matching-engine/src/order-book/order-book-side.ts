import { Order } from "../order/order";
import { OrderComparator } from "./comparator/order-comparator";

export class OrderBookSide {
  private readonly orders: Order[] = [];

  constructor(private readonly comparator: OrderComparator) {}

  add(order: Order): void {
    this.orders.push(order);
    this.orders.sort(this.comparator.compare);
  }

  remove(order: Order): void {
    const index = this.orders.findIndex((existingOrder) =>
      existingOrder.id.equals(order.id),
    );

    if (index === -1) throw new Error("Order not found");

    this.orders.splice(index, 1);
  }

  getOrders(): readonly Order[] {
    return this.orders;
  }

  best(): Order | null {
    return this.orders[0] ?? null;
  }
}
