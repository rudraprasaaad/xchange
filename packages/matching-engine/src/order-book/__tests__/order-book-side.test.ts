import { describe, expect, it } from "vitest";

import { Order } from "../../order/order";
import { OrderCreatedAt } from "../../order/order-created-at";
import { OrderId } from "../../order/order-id";
import { OrderPrice } from "../../order/order-price";
import { OrderQuantity } from "../../order/order-quantity";
import { OrderBookSide } from "../order-book-side";
import { AskOrderComparator } from "../comparator/ask-order-comparator";
import { BidOrderComparator } from "../comparator/bid-order-comparator";

function createAskSide() {
  return new OrderBookSide(new AskOrderComparator());
}

function createBidSide() {
  return new OrderBookSide(new BidOrderComparator());
}

describe("OrderBookSide", () => {
  it("returns null when no orders exist", () => {
    const side = createAskSide();

    expect(side.best()).toBeNull();
  });

  it("returns the best order after adding a single order", () => {
    const side = createAskSide();

    const order = new Order(
      new OrderId("1"),
      "sell",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    side.add(order);

    expect(side.best()).toBe(order);
  });

  it("returns the highest priority order after adding multiple orders", () => {
    const side = createAskSide();

    const higherPriceOrder = new Order(
      new OrderId("1"),
      "sell",
      new OrderPrice(105),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date("2026-01-01")),
    );

    const lowerPriceOrder = new Order(
      new OrderId("2"),
      "sell",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date("2026-01-02")),
    );

    side.add(higherPriceOrder);
    side.add(lowerPriceOrder);

    expect(side.best()).toBe(lowerPriceOrder);
  });

  it("returns the highest priority buy order after adding multiple orders", () => {
    const side = createBidSide();

    const lowerPriceOrder = new Order(
      new OrderId("1"),
      "buy",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date("2026-01-01")),
    );

    const higherPriceOrder = new Order(
      new OrderId("2"),
      "buy",
      new OrderPrice(105),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date("2026-01-02")),
    );

    side.add(lowerPriceOrder);
    side.add(higherPriceOrder);

    expect(side.best()).toBe(higherPriceOrder);
  });
});
