export class RemainingOrderQuantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error("Remaining order must not be non negative.");
    }
  }
}
