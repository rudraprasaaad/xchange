export class OrderQuantity {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Order quantity must not be negative.");
    }
  }
}
