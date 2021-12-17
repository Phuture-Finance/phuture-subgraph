import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Order, OrderDetailsInfo, _OrderIdLink } from '../../types/schema';

export function loadOrCreateOrderLink(order_id: BigInt): _OrderIdLink {
  let orderLink = _OrderIdLink.load(order_id.toHexString());
  if (!orderLink) {
    orderLink = new _OrderIdLink(order_id.toHexString());
  }

  return orderLink as _OrderIdLink;
}

export function loadOrCreateOrder(id: Address): Order {
  let order = Order.load(id.toHexString());
  if (!order) {
    order = new Order(id.toHexString());
  }

  return order as Order;
}

export function loadOrCreateOrderDetails(order_id: BigInt, asset: Address): OrderDetailsInfo {
  let id = order_id.toString().concat('-').concat(asset.toHexString());

  let orderDetails = OrderDetailsInfo.load(id);
  if (!orderDetails) {
    orderDetails = new OrderDetailsInfo(id);
  }

  return orderDetails as OrderDetailsInfo;
}
