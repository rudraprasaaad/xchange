import { Order } from "../order/order";
import { OrderBookSide } from "./order-book-side";

export class OrderBook {
  constructor(
    private readonly bidSide: OrderBookSide,
    private readonly askSide: OrderBookSide,
  ) {}

  add(order: Order): void {
    if (order.side === "buy") {
      this.bidSide.add(order);
      return;
    }

    this.askSide.add(order);
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
