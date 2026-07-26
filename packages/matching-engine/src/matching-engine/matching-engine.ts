import { MatchingPolicy } from "../matching/matching-policy";
import { OrderBook } from "../order-book/order-book";
import { Order } from "../order/order";
import { Trade } from "../trade/trade";
import { MatchingResult } from "./matching-result";

export class MatchingEngine {
  constructor(
    private readonly orderBook: OrderBook,
    private readonly matchingPolicy: MatchingPolicy,
  ) {}

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

    if (!this.matchingPolicy.canMatch(incomingOrder, restingOrder)) {
      return {
        trades: [],
        restingOrder: incomingOrder,
      };
    }

    return {
      trades: [new Trade()],
      restingOrder: null,
    };
  }
}
