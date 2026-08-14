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

function createMatchingEngine() {
  const orderBook = createOrderBook();

  const matchingEngine = new MatchingEngine(orderBook, new MatchingPolicy());

  return {
    orderBook,
    matchingEngine,
  };
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

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.quantity.value).toBe(10);
  });

  it("records the resting order price as the trade price", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(99)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.price.value).toBe(100);
  });

  it("records the resting order id on the trade", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(99)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.restingOrderId).toBe(buyOrder.id);
  });

  it("records the incoming order id on the trade", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();
    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(99)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0];
    expect(trade!.incomingOrderId).toBe(sellOrder.id);
  });

  it("records the incoming order id on the trade", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(10)
      .build();

    orderBook.add(buyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(99)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);

    const trade = result.trades[0];

    expect(trade!.incomingOrderId).toBe(sellOrder.id);
  });

  it("stops matching when the next best order no longer satisfies the matching policy", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const firstBuyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    const secondBuyOrder = OrderBuilder.aBuyOrder()
      .withPrice(98)
      .withQuantity(6)
      .build();

    orderBook.add(firstBuyOrder);
    orderBook.add(secondBuyOrder);

    expect(orderBook.bestBid()).toBe(firstBuyOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(99)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);

    const trade = result.trades[0];

    expect(trade!.quantity.value).toBe(4);
    expect(trade!.price.value).toBe(100);

    expect(firstBuyOrder.isFilled()).toBe(true);
    expect(secondBuyOrder.isFilled()).toBe(false);
    expect(secondBuyOrder.getRemainingQuantity().value).toBe(6);

    expect(sellOrder.isFilled()).toBe(false);
    expect(sellOrder.getRemainingQuantity().value).toBe(6);
  });

  it("continues matching an incoming buy order against multiple resting sell orders", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const firstSellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(6)
      .build();
    const secondSellOrder = OrderBuilder.aSellOrder()
      .withPrice(102)
      .withQuantity(6)
      .build();

    orderBook.add(firstSellOrder);
    orderBook.add(secondSellOrder);

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(103)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(2);

    expect(result.trades[0]!.quantity.value).toBe(6);
    expect(result.trades[0]!.price.value).toBe(100);

    expect(result.trades[1]!.quantity.value).toBe(4);
    expect(result.trades[1]!.price.value).toBe(102);

    expect(firstSellOrder.isFilled()).toBe(true);
    expect(secondSellOrder.isFilled()).toBe(false);
    expect(secondSellOrder.getRemainingQuantity().value).toBe(2);
    expect(buyOrder.isFilled()).toBe(true);

    expect(orderBook.bestAsk()).toBe(secondSellOrder);
  });

  it("stops matching an incoming buy order when the next best sell no longer satisfies the matching policy", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const firstSellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    const secondSellOrder = OrderBuilder.aSellOrder()
      .withPrice(102)
      .withQuantity(6)
      .build();

    orderBook.add(firstSellOrder);
    orderBook.add(secondSellOrder);

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(101)
      .withQuantity(10)
      .build();

    const result = matchingEngine.process(buyOrder);
    expect(result.trades).toHaveLength(1);

    const trade = result.trades[0];

    expect(trade!.quantity.value).toBe(4);
    expect(trade!.price.value).toBe(100);

    expect(firstSellOrder.isFilled()).toBe(true);

    expect(secondSellOrder.isFilled()).toBe(false);
    expect(secondSellOrder.getRemainingQuantity().value).toBe(6);

    expect(buyOrder.isFilled()).toBe(false);
    expect(buyOrder.getRemainingQuantity().value).toBe(6);

    expect(orderBook.bestAsk()).toBe(secondSellOrder);
    expect(orderBook.bestBid()).toBe(buyOrder);
  });

  it("prioritizes the earlier buy order when prices are equal", () => {
    const { orderBook } = createMatchingEngine();

    const earlierOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withCreatedAt(new Date("2026-01-01T10:00:00Z"))
      .build();

    const laterOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withCreatedAt(new Date("2026-01-01T10:01:00Z"))
      .build();

    orderBook.add(laterOrder);
    orderBook.add(earlierOrder);

    expect(orderBook.bestBid()).toBe(earlierOrder);
  });

  it("prioritizes the earlier sell order when prices are equal", () => {
    const { orderBook } = createMatchingEngine();

    const earlierOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withCreatedAt(new Date("2026-01-01T10:00:00Z"))
      .build();

    const laterOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withCreatedAt(new Date("2026-01-01T10:01:00Z"))
      .build();

    orderBook.add(laterOrder);
    orderBook.add(earlierOrder);

    expect(orderBook.bestAsk()).toBe(earlierOrder);
  });

  it("matches the earlier buy order first when buy prices are equal", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const earlierOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .withCreatedAt(new Date("2026-01-01T10:00:00Z"))
      .build();

    const laterOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .withCreatedAt(new Date("2026-01-01T10:01:00Z"))
      .build();

    orderBook.add(laterOrder);
    orderBook.add(earlierOrder);

    const sellOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    const result = matchingEngine.process(sellOrder);

    expect(result.trades).toHaveLength(1);
    expect(earlierOrder.isFilled()).toBe(true);
    expect(laterOrder.isFilled()).toBe(false);
    expect(laterOrder.getRemainingQuantity().value).toBe(4);
  });

  it("matches the earlier sell order first when sell prices are equal", () => {
    const { orderBook, matchingEngine } = createMatchingEngine();

    const earlierOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .withCreatedAt(new Date("2026-01-01T10:00:00Z"))
      .build();

    const laterOrder = OrderBuilder.aSellOrder()
      .withPrice(100)
      .withQuantity(4)
      .withCreatedAt(new Date("2026-01-01T10:01:00Z"))
      .build();

    orderBook.add(laterOrder);
    orderBook.add(earlierOrder);

    const buyOrder = OrderBuilder.aBuyOrder()
      .withPrice(100)
      .withQuantity(4)
      .build();

    const result = matchingEngine.process(buyOrder);

    expect(result.trades).toHaveLength(1);

    expect(earlierOrder.isFilled()).toBe(true);
    expect(laterOrder.isFilled()).toBe(false);
    expect(laterOrder.getRemainingQuantity().value).toBe(4);
    expect(buyOrder.isFilled()).toBe(true);
  });
});
