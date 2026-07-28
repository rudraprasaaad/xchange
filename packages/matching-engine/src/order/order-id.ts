export class OrderId {
  constructor(public readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error("Order id must not be empty");
    }
  }
  equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}
