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
import { PlaceOrderInput } from "../place-order-input";

describe("PlaceOrder", () => {
  it("processes an order through the matching engine", () => {
    const orderBook = new OrderBook();
    const matchingEngine = new MatchingEngine(orderBook, new MatchingPolicy());

    const input: PlaceOrderInput = {
      id: "order-1",
      side: "buy",
      price: 100,
      quantity: 10,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    };

    const placeOrder = new PlaceOrder(matchingEngine);

    const result = placeOrder.execute(input);

    expect(result.trades).toHaveLength(0);

    expect(result.restingOrder).not.toBeNull();
    expect(result.restingOrder!.id.value).toBe("order-1");
    expect(result.restingOrder!.side).toBe("buy");
    expect(result.restingOrder!.price.value).toBe(100);
    expect(result.restingOrder!.getRemainingQuantity().value).toBe(10);

    expect(orderBook.bestBid()).toBe(result.restingOrder);
  });
});
