import { describe, expect, test } from "vitest";
import { OrderBook } from "../order-book";
import { Order } from "../../order/order";
import { OrderPrice } from "../../order/order-price";
import { OrderQuantity } from "../../order/order-quantity";
import { OrderId } from "../../order/order-id";

describe("OrderBook", () => {
  test("adds buy orders to bids", () => {
    const orderBook = new OrderBook();

    const buyOrder = new Order(
      new OrderId("order_1"),
      "buy",
      new OrderPrice(100000),
      new OrderQuantity(1),
    );

    orderBook.add(buyOrder);

    expect(orderBook.getBids()).toHaveLength(1);
    expect(orderBook.getAsks()).toHaveLength(0);
  });

  test("adds sell orders to asks", () => {
    const orderBook = new OrderBook();

    const sellOrder = new Order(
      new OrderId("order_2"),
      "sell",
      new OrderPrice(101000),
      new OrderQuantity(1),
    );

    orderBook.add(sellOrder);

    expect(orderBook.getBids()).toHaveLength(0);
    expect(orderBook.getAsks()).toHaveLength(1);
  });
});
