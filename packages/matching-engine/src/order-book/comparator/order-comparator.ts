import { Order } from "../../order/order";

export interface OrderComparator {
  compare(left: Order, right: Order): number;
}
