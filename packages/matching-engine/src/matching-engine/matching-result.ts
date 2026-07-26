import { Order } from "../order/order";
import { Trade } from "../trade/trade";

export interface MatchingResult {
  trades: Trade[];
  restingOrder: Order | null;
}
