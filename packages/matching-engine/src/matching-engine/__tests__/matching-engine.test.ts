import { describe, expect, it } from "vitest";
import { AskOrderComparator } from "../../order-book/comparator/ask-order-comparator";
import { BidOrderComparator } from "../../order-book/comparator/bid-order-comparator";
import { OrderBook } from "../../order-book/order-book";
import { OrderBookSide } from "../../order-book/order-book-side";
import { MatchingEngine } from "../matching-engine";
import { OrderBuilder } from "../../test/builders/order-builder";

function createOrderBook() {
  return new OrderBook(
    new OrderBookSide(new BidOrderComparator()),
    new OrderBookSide(new AskOrderComparator()),
  );
}

describe("MatchingEngine", () => {
  it("adds an incoming buy order to the order book when no matching sell order exists", () => {
    const orderBook = createOrderBook();
    const matchingEngine = new MatchingEngine(orderBook);

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toEqual([]);
    expect(result.restingOrder);
  });

  it("adds an incoming sell order to the order book when no matching buy order exists", () => {
    const orderBook = createOrderBook();
    const matchingEngine = new MatchingEngine(orderBook);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toEqual([]);
    expect(result.restingOrder).toBe(sellOrder);

    expect(orderBook.bestAsk()).toBe(sellOrder);
    expect(orderBook.bestBid()).toBe(null);
  });

  it("creates a trade when an incoming buy order crosses the best sell order", () => {
    const orderBook = createOrderBook();
    const matchingEngine = new MatchingEngine(orderBook);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    orderBook.add(sellOrder);

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(1);
  });

  it("does not create a trade when an incoming buy order price is lower than the best ask", () => {
    const orderBook = createOrderBook();
    const matchingEngine = new MatchingEngine(orderBook);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(101).build();

    orderBook.add(sellOrder);

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(0);
  });
});
