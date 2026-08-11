import { OrderPrice } from "../order/order-price";
import { OrderQuantity } from "../order/order-quantity";

export class Trade {
	constructor(public readonly quantity: OrderQuantity, public readonly price: OrderPrice){}
}
