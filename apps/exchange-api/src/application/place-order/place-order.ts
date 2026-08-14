import { MatchingEngine, MatchingResult, Order } from "@repo/matching-engine";

export class PlaceOrder {
  constructor(private readonly matchingEngine: MatchingEngine) {}

  execute(order: Order): MatchingResult {
    return this.matchingEngine.process(order);
  }
}
