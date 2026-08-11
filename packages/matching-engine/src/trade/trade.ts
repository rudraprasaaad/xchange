import { OrderQuantity } from "../order/order-quantity";

export class Trade {
	constructor(public readonly quantity: OrderQuantity){}
}
