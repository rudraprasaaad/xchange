import { Order } from "../../order/order";
import { OrderCreatedAt } from "../../order/order-created-at";
import { OrderId } from "../../order/order-id";
import { OrderPrice } from "../../order/order-price";
import { OrderQuantity } from "../../order/order-quantity";
import { OrderSide } from "../../order/order-side";

export class OrderBuilder {
  private static buyCounter = 1;
  private static sellCounter = 1;

  private readonly side: OrderSide;

  private price = 100;
  private quantity = 1;
  private createdAt = new Date("2026-01-01T00:00:00Z");

  private constructor(side: OrderSide) {
    this.side = side;
  }

  static aBuyOrder(): OrderBuilder {
    return new OrderBuilder("buy");
  }

  static aSellOrder(): OrderBuilder {
    return new OrderBuilder("sell");
  }

  withPrice(price: number): this {
    this.price = price;
    return this;
  }

  withQuantity(quantity: number): this {
    this.quantity = quantity;
    return this;
  }

  withCreatedAt(createdAt: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  build() {
    const orderId =
      this.side === "buy"
        ? new OrderId(`buy-${OrderBuilder.buyCounter++}`)
        : new OrderId(`sell-${OrderBuilder.sellCounter++}`);
    const price = new OrderPrice(this.price);

    const quantity = new OrderQuantity(this.quantity);

    const createdAt = new OrderCreatedAt(this.createdAt);

    return new Order(orderId, this.side, price, quantity, createdAt);
  }
}
