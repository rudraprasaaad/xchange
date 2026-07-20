import { describe, expect, it } from "vitest";

import { Order } from "../../order/order";
import { OrderCreatedAt } from "../../order/order-created-at";
import { OrderId } from "../../order/order-id";
import { OrderPrice } from "../../order/order-price";
import { OrderQuantity } from "../../order/order-quantity";
import { OrderBook } from "../order-book";
import { OrderBookSide } from "../order-book-side";
import { BidOrderComparator } from "../comparator/bid-order-comparator";
import { AskOrderComparator } from "../comparator/ask-order-comparator";

function createOrderBook() {
  return new OrderBook(
    new OrderBookSide(new BidOrderComparator()),
    new OrderBookSide(new AskOrderComparator()),
  );
}

describe("OrderBook", () => {
  it("adds buy orders to the bid side", () => {
    const orderBook = createOrderBook();

    const buyOrder = new Order(
      new OrderId("1"),
      "buy",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    orderBook.add(buyOrder);

    expect(orderBook.bestBid()).toBe(buyOrder);
  });

  it("adds sell orders to the ask side", () => {
    const orderBook = createOrderBook();

    const sellOrder = new Order(
      new OrderId("1"),
      "sell",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    orderBook.add(sellOrder);

    expect(orderBook.bestAsk()).toBe(sellOrder);
  });

  it("returns the best bid", () => {
    const orderBook = createOrderBook();

    const lowerBid = new Order(
      new OrderId("1"),
      "buy",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    const higherBid = new Order(
      new OrderId("2"),
      "buy",
      new OrderPrice(105),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    orderBook.add(lowerBid);
    orderBook.add(higherBid);

    expect(orderBook.bestBid()).toBe(higherBid);
  });

  it("returns the best ask", () => {
    const orderBook = createOrderBook();

    const higherAsk = new Order(
      new OrderId("1"),
      "sell",
      new OrderPrice(105),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

    const lowerAsk = new Order(
      new OrderId("2"),
      "sell",
      new OrderPrice(100),
      new OrderQuantity(1),
      new OrderCreatedAt(new Date()),
    );

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
});
