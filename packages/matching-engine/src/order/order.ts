import { OrderId } from "./order-id";
import { OrderPrice } from "./order-price";
import { OrderQuantity } from "./order-quantity";
import { OrderSide } from "./order-side";
import { RemainingOrderQuantity } from "./remaining-order-quantity";

export class Order {
  private remainingQuantity: RemainingOrderQuantity;

  constructor(
    public readonly id: OrderId,
    public readonly side: OrderSide,
    public readonly price: OrderPrice,
    public readonly quantity: OrderQuantity,
  ) {
    this.remainingQuantity = new RemainingOrderQuantity(quantity.value);
  }

  getRemainingQuantity(): RemainingOrderQuantity {
    return this.remainingQuantity;
  }

  fill(quantity: OrderQuantity) {
    const nextRemainingQuantity = this.remainingQuantity.value - quantity.value;

    if (nextRemainingQuantity < 0)
      throw new Error("Fill quantity cannot exceed remaining quantity");

    this.remainingQuantity = new RemainingOrderQuantity(nextRemainingQuantity);
  }

  isFilled(): boolean {
    return this.remainingQuantity.value === 0;
  }
}
