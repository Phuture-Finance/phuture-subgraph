import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Order, OrderDetailsInfo, LastOrderIndex } from '../../types/schema';

export function loadOrCreateLastOrderIndex(id: Address): LastOrderIndex {
  let orderLink = LastOrderIndex.load(id.toHexString());
  if (!orderLink) {
    orderLink = new LastOrderIndex(id.toHexString());
  }

  return orderLink as LastOrderIndex;
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
