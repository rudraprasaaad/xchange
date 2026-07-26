import { describe, expect, it } from "vitest";

import { OrderBookSide } from "../order-book-side";
import { AskOrderComparator } from "../comparator/ask-order-comparator";
import { BidOrderComparator } from "../comparator/bid-order-comparator";
import { OrderBuilder } from "../../test/builders/order-builder";

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

    const order = OrderBuilder.aSellOrder().withPrice(100).build();

    side.add(order);

    expect(side.best()).toBe(order);
  });

  it("returns the highest priority order after adding multiple orders", () => {
    const side = createAskSide();

    const higherPriceOrder = OrderBuilder.aSellOrder().withPrice(105).build();
    const lowerPriceOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    side.add(higherPriceOrder);
    side.add(lowerPriceOrder);

    expect(side.best()).toBe(lowerPriceOrder);
  });

  it("returns the highest priority buy order after adding multiple orders", () => {
    const side = createBidSide();

    const lowerPriceOrder = OrderBuilder.aBuyOrder().withPrice(100).build();
    const higherPriceOrder = OrderBuilder.aBuyOrder().withPrice(105).build();

    side.add(lowerPriceOrder);
    side.add(higherPriceOrder);

    expect(side.best()).toBe(higherPriceOrder);
  });
});
