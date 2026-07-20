import { Order } from "../../order/order";
import { OrderComparator } from "./order-comparator";

export class AskOrderComparator implements OrderComparator {
  compare(left: Order, right: Order): number {
    if (left.price.value !== right.price.value)
      return left.price.value - right.price.value;
    return left.createdAt.value.getTime() - right.createdAt.value.getTime();
  }
}
