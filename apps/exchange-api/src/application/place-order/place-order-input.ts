export interface PlaceOrderInput {
  id: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  createdAt: Date;
}
