import { describe, expect, test } from "vitest";
import { Order } from "../order";
import { OrderId } from "../order-id";
import { OrderPrice } from "../order-price";
import { OrderQuantity } from "../order-quantity";
import { OrderCreatedAt } from "../order-created-at";

describe("Order", () => {
  test("reduces remaining quantity when filled", () => {
    const order = new Order(
      new OrderId("order_1"),
      "buy",
      new OrderPrice(100000),
      new OrderQuantity(5),
      new OrderCreatedAt(new Date()),
    );

    order.fill(new OrderQuantity(2));

    expect(order.getRemainingQuantity().value).toBe(3);
  });

  test("knows when it is fully filled", () => {
    const order = new Order(
      new OrderId("order_2"),
      "buy",
      new OrderPrice(100000),
      new OrderQuantity(5),
      new OrderCreatedAt(new Date()),
    );

    order.fill(new OrderQuantity(5));

    expect(order.getRemainingQuantity().value).toBe(0);
    expect(order.isFilled()).toBe(true);
  });

  test("reduces remaining quantity for sell order", () => {
    const order = new Order(
      new OrderId("order_3"),
      "sell",
      new OrderPrice(99000),
      new OrderQuantity(5),
      new OrderCreatedAt(new Date()),
    );

    order.fill(new OrderQuantity(2));

    expect(order.getRemainingQuantity().value).toBe(3);
  });
});
