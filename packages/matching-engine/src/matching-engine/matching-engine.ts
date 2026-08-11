import { MatchingPolicy } from "../matching/matching-policy";
import { OrderBook } from "../order-book/order-book";
import { Order } from "../order/order";
import { OrderQuantity } from "../order/order-quantity";
import { Trade } from "../trade/trade";
import { MatchingResult } from "./matching-result";

export class MatchingEngine {
  constructor(
    private readonly orderBook: OrderBook,
    private readonly matchingPolicy: MatchingPolicy,
  ) {}

  process(incomingOrder: Order): MatchingResult {
    const trades: Trade[] = [];

    while(!incomingOrder.isFilled()) {
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

    const tradedQuantity = new OrderQuantity(
      Math.min(
        incomingOrder.getRemainingQuantity().value,
        restingOrder.getRemainingQuantity().value,
      ),
    );

    restingOrder.fill(tradedQuantity);
    incomingOrder.fill(tradedQuantity);

    if (restingOrder.isFilled()) this.orderBook.remove(restingOrder);

    trades.push(new Trade(tradedQuantity, restingOrder.price, restingOrder.id));
    }
    
    if (!incomingOrder.isFilled()) this.orderBook.add(incomingOrder);

    return {
      trades,
      restingOrder: incomingOrder.isFilled() ? null : incomingOrder,
    };
  }
}
