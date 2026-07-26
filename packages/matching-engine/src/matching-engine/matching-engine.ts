import { OrderBook } from "../order-book/order-book";
import { Order } from "../order/order";
import { MatchingResult } from "./matching-result";

export class MatchingEngine {
  constructor(private readonly orderBook: OrderBook) {}

  process(incomingOrder: Order): MatchingResult {
    const restingOrder =
      incomingOrder.side === "buy"
        ? this.orderBook.bestAsk()
        : this.orderBook.bestBid();

    if (restingOrder === null) {
      this.orderBook.add(incomingOrder);

      return {
        trades: [],
        restingOrder: incomingOrder,
      };
    }

    return {
      trades: [],
      restingOrder: null,
    };
  }
}
