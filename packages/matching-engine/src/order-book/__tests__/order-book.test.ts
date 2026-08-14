import { describe, expect, it } from "vitest";

import { OrderBook } from "../order-book";
import { OrderBuilder } from "../../test/builders/order-builder";
import { MatchingEngine } from "../../matching-engine/matching-engine";
import { MatchingPolicy } from "../../matching/matching-policy";

function createOrderBook() {
  return new OrderBook();
}

describe("OrderBook", () => {
  it("adds buy orders to the bid side", () => {
    const orderBook = createOrderBook();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    orderBook.add(buyOrder);

    expect(orderBook.bestBid()).toBe(buyOrder);
  });

  it("adds sell orders to the ask side", () => {
    const orderBook = createOrderBook();

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    orderBook.add(sellOrder);

    expect(orderBook.bestAsk()).toBe(sellOrder);
  });

  it("returns the best bid", () => {
    const orderBook = createOrderBook();

    const lowerBid = OrderBuilder.aBuyOrder().withPrice(100).build();
    const higherBid = OrderBuilder.aBuyOrder().withPrice(105).build();

    orderBook.add(lowerBid);
    orderBook.add(higherBid);

    expect(orderBook.bestBid()).toBe(higherBid);
  });

  it("returns the best ask", () => {
    const orderBook = createOrderBook();

    const higherAsk = OrderBuilder.aSellOrder().withPrice(105).build();
    const lowerAsk = OrderBuilder.aSellOrder().withPrice(100).build();

    orderBook.add(higherAsk);
    orderBook.add(lowerAsk);

    expect(orderBook.bestAsk()).toBe(lowerAsk);
  });

  it("returns null when there are no buy orders", () => {
    const orderBook = createOrderBook();

    expect(orderBook.bestBid()).toBeNull();
  });

  it("returns null when there are no sell orders", () => {
    const orderBook = createOrderBook();

    expect(orderBook.bestAsk()).toBeNull();
  });

  it("removes an order from the order book when cancelled", () => {
    const orderBook = createOrderBook();

    const order = OrderBuilder.aBuyOrder().withPrice(100).build();

    orderBook.add(order);

    orderBook.remove(order);

    expect(orderBook.bestBid()).toBeNull();
  });

  it("does not match an order after it is removed from the order book", () => {
    const orderBook = createOrderBook();

    const matchingEngine = new MatchingEngine(orderBook, new MatchingPolicy());
    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    orderBook.add(buyOrder);
    orderBook.remove(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();
    orderBook.add(sellOrder);

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(0);
    expect(sellOrder.isFilled()).toBe(false);
    expect(orderBook.bestAsk()).toBe(sellOrder);
  });
});
