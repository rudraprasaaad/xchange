import { Order } from "../order/order";

export class MatchingPolicy {
  canMatch(incoming: Order, resting: Order): boolean {
    if (incoming.side === "buy")
      return incoming.price.value >= resting.price.value;

    return incoming.price.value <= resting.price.value;
  }
}
