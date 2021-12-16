import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Order, OrderDetails } from '../../types/schema';

export function loadOrCreateOrder(address: Address): Order {
  let id = address.toHexString();
  let order = Order.load(id);
  if (!order) {
    order = new Order(id);
    order.index = id;
  }

  return order as Order;
}

export function loadOrCreateOrderDetails(order_id: BigInt, asset: Address): OrderDetails {
  let id = order_id.toString().concat('-').concat(asset.toHexString());

  let orderDetails = OrderDetails.load(id);
  if (!orderDetails) {
    orderDetails = new OrderDetails(id);
  }

  return orderDetails as OrderDetails;
}
