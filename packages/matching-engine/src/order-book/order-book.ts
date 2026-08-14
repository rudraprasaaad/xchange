import { Order } from "../order/order";
import { AskOrderComparator } from "./comparator/ask-order-comparator";
import { BidOrderComparator } from "./comparator/bid-order-comparator";
import { OrderBookSide } from "./order-book-side";

export class OrderBook {
  private readonly bidSide: OrderBookSide;
  private readonly askSide: OrderBookSide;
  constructor() {
    this.bidSide = new OrderBookSide(new BidOrderComparator());
    this.askSide = new OrderBookSide(new AskOrderComparator());
  }

  add(order: Order): void {
    if (order.side === "buy") {
      this.bidSide.add(order);
      return;
    }

    this.askSide.add(order);
  }

  remove(order: Order): void {
    if (order.side === "buy") {
      this.bidSide.remove(order.id);
      return;
    }

    this.askSide.remove(order.id);
  }

  cancel(order: Order): void {
    if (order.side === "buy") {
      this.bidSide.remove(order.id);
      return;
    }

    this.askSide.remove(order.id);
  }

  bestBid(): Order | null {
    return this.bidSide.best();
  }

  bestAsk(): Order | null {
    return this.askSide.best();
  }

  getBidSide(): OrderBookSide {
    return this.bidSide;
  }

  getAsksSide(): OrderBookSide {
    return this.askSide;
  }
}
