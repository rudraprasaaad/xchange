import { Order } from "../order/order";

export class OrderBook {
  private bids: Order[] = [];
  private asks: Order[] = [];

  add(order: Order): void {
    if (order.side === "buy") {
      this.bids.push(order);
      return;
    }
    this.asks.push(order);
  }

  getBids(): Order[] {
    return this.bids;
  }

  getAsks(): Order[] {
    return this.asks;
  }
}
