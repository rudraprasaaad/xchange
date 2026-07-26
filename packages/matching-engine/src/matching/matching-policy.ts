import { Order } from "../order/order";

export class MatchingPolicy {
  canMatch(incoming: Order, resting: Order): boolean {
    if (incoming.side === "buy")
      return incoming.price.isGreaterThanOrEqualTo(resting.price);

    return incoming.price.isLessThanOrEqualTo(resting.price);
  }
}
