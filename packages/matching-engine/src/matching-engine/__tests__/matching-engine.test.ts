import { describe, expect, it } from "vitest";
import { AskOrderComparator } from "../../order-book/comparator/ask-order-comparator";
import { BidOrderComparator } from "../../order-book/comparator/bid-order-comparator";
import { OrderBook } from "../../order-book/order-book";
import { OrderBookSide } from "../../order-book/order-book-side";
import { MatchingEngine } from "../matching-engine";
import { OrderBuilder } from "../../test/builders/order-builder";
import { MatchingPolicy } from "../../matching/matching-policy";
import { Order } from "../../order/order";

function createOrderBook() {
  return new OrderBook(
    new OrderBookSide(new BidOrderComparator()),
    new OrderBookSide(new AskOrderComparator()),
  );
}

function createMatchingEngine(){
  const orderBook = createOrderBook();

  const matchingEngine = new MatchingEngine(orderBook, new MatchingPolicy());

  return {
    orderBook, matchingEngine,
  }
}

describe("MatchingEngine", () => {
  it("adds an incoming buy order to the order book when no matching sell order exists", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toEqual([]);
    expect(result.restingOrder);
  });

  it("adds an incoming sell order to the order book when no matching buy order exists", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toEqual([]);
    expect(result.restingOrder).toBe(sellOrder);

    expect(orderBook.bestAsk()).toBe(sellOrder);
    expect(orderBook.bestBid()).toBe(null);
  });

  it("creates a trade when an incoming buy order crosses the best sell order", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    orderBook.add(sellOrder);

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(1);
  });

  it("does not create a trade when an incoming buy order price is lower than the best ask", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const sellOrder = OrderBuilder.aSellOrder().withPrice(101).build();

    orderBook.add(sellOrder);

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(0);
  });

  it("does not create a trade when an incoming sell order price is larger than the best bid", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(101).build();
    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(0);
  });

  it("creates a trade when an incoming sell order price equals the best bid", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).build();

    const result = matchingEngine.process(sellOrder);
    expect(result.trades).toHaveLength(1);
  });

  it("reduces the quantities of both orders after a successful trade", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    matchingEngine.process(sellOrder);
    expect(buyOrder.getRemainingQuantity().value).toBe(0);
    expect(sellOrder.getRemainingQuantity().value).toBe(0);
  });

  it("partially fills the resting buy order when the incoming sell order quantity is smaller", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    matchingEngine.process(sellOrder);

    expect(buyOrder.getRemainingQuantity().value).toBe(6);
    expect(sellOrder.getRemainingQuantity().value).toBe(0);
  });

  it("partially fills the incoming sell order when the resting buy order quantity is smaller", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    matchingEngine.process(sellOrder);

    expect(buyOrder.getRemainingQuantity().value).toBe(0);
    expect(sellOrder.getRemainingQuantity().value).toBe(6);
  });

  it("removes a fully filled resting order from the order book", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    matchingEngine.process(sellOrder);

    expect(orderBook.bestBid()).toBeNull();
  });

  it("adds the remaining incoming sell order to the order book when it is partially filled", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    matchingEngine.process(sellOrder);

    expect(orderBook.bestBid()).toBeNull();

    expect(orderBook.bestAsk()).toBe(sellOrder);
    expect(orderBook.bestAsk()?.getRemainingQuantity().value).toBe(6);
  });

  it("continues matching the incoming sell order until it is fully filled", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const firstBuyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    const secondBuyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(6)
      .build();

    orderBook.add(firstBuyOrder);
    orderBook.add(secondBuyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    matchingEngine.process(sellOrder);

    expect(orderBook.bestBid()).toBeNull();
    expect(orderBook.bestAsk()).toBeNull();

    expect(firstBuyOrder.isFilled()).toBe(true);
    expect(secondBuyOrder.isFilled()).toBe(true);
    expect(sellOrder.isFilled()).toBe(true);
  });

  it("records the traded quantity", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).withQuantity(10).build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(100).withQuantity(10).build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.quantity.value).toBe(10);
  })

  it("records the resting order price as the trade price", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder().withPrice(100).withQuantity(10).build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder().withPrice(99).withQuantity(10).build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.price.value).toBe(100);
  })
});
