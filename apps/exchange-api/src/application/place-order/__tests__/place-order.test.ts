import {
  MatchingEngine,
  MatchingPolicy,
  Order,
  OrderBook,
  OrderCreatedAt,
  OrderId,
  OrderPrice,
  OrderQuantity,
} from "@repo/matching-engine";
import { describe, expect, it } from "vitest";
import { PlaceOrder } from "../place-order";

describe("PlaceOrder", () => {
  it("processes an order through the matching engine", () => {
    const orderBook = new OrderBook();
    const matchingEngine = new MatchingEngine(orderBook, new MatchingPolicy());

    const order = new Order(
      new OrderId("order-1"),
      "buy",
      new OrderPrice(100),
      new OrderQuantity(10),
      new OrderCreatedAt(new Date("2026-01-01T00:00:00Z")),
    );

    const placeOrder = new PlaceOrder(matchingEngine);

    const result = placeOrder.execute(order);

    expect(result.restingOrder).toBe(order);
    expect(result.trades).toHaveLength(0);
    expect(orderBook.bestBid()).toBe(order);
  });
});
