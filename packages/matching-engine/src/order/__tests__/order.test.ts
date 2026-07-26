import { describe, expect, test } from "vitest";
import { OrderQuantity } from "../order-quantity";
import { OrderBuilder } from "../../test/builders/order-builder";

describe("Order", () => {
  test("reduces remaining quantity when filled", () => {
    const order = OrderBuilder.aBuyOrder()
      .withPrice(100000)
      .withQuantity(5)
      .build();

    order.fill(new OrderQuantity(2));

    expect(order.getRemainingQuantity().value).toBe(3);
  });

  test("knows when it is fully filled", () => {
    const order = OrderBuilder.aBuyOrder()
      .withPrice(100000)
      .withQuantity(5)
      .build();

    order.fill(new OrderQuantity(5));

    expect(order.getRemainingQuantity().value).toBe(0);
    expect(order.isFilled()).toBe(true);
  });

  test("reduces remaining quantity for sell order", () => {
    const order = OrderBuilder.aSellOrder()
      .withPrice(99000)
      .withQuantity(5)
      .build();

    order.fill(new OrderQuantity(2));

    expect(order.getRemainingQuantity().value).toBe(3);
  });
});
