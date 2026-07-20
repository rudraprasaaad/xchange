import { Order } from "../order/order";
import { OrderComparator } from "./comparator/order-comparator";

export class OrderBookSide {
  private readonly orders: Order[] = [];

  constructor(private readonly comparator: OrderComparator) {}

  add(order: Order): void {
    this.orders.push(order);
    this.orders.sort(this.comparator.compare);
  }

  getOrders(): readonly Order[] {
    return this.orders;
  }

  best(): Order | null {
    return this.orders[0] ?? null;
  }
}
