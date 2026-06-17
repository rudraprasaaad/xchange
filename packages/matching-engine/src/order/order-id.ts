export class OrderId {
  constructor(public readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error("Order id must not be empty");
    }
  }
}
