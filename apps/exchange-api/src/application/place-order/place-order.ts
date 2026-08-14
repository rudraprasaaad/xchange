import {
  MatchingEngine,
  MatchingResult,
  Order,
  OrderCreatedAt,
  OrderId,
  OrderPrice,
  OrderQuantity,
} from "@repo/matching-engine";
import { PlaceOrderInput } from "./place-order-input";

export class PlaceOrder {
  constructor(private readonly matchingEngine: MatchingEngine) {}

  execute(input: PlaceOrderInput): MatchingResult {
    const order = new Order(
      new OrderId(input.id),
      input.side,
      new OrderPrice(input.price),
      new OrderQuantity(input.quantity),
      new OrderCreatedAt(input.createdAt),
    );

    return this.matchingEngine.process(order);
  }
}
