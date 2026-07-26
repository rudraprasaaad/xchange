import { Order } from "../order/order";

export interface MatchingResult {
  trades: unknown[];
  restingOrder: Order | null;
}
