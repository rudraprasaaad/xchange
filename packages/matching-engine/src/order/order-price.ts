export class OrderPrice {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Order price must be greater than zero");
    }
  }
}
