import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Order, OrderDetailsInfo, LastOrderIndex } from '../../types/schema';

export function loadOrCreateLastOrderIndex(id: Address): LastOrderIndex {
  let orderLink = LastOrderIndex.load(id.toHexString());
  if (!orderLink) {
    orderLink = new LastOrderIndex(id.toHexString());
  }

  return orderLink as LastOrderIndex;
}

export function loadOrCreateOrder(id: string): Order {
  let order = Order.load(id);
  if (!order) {
    order = new Order(id);
  }

  return order as Order;
}

export function loadOrCreateOrderDetails(orderId: BigInt, asset: Address): OrderDetailsInfo {
  let id = orderId.toString().concat('-').concat(asset.toHexString());

  let orderDetails = OrderDetailsInfo.load(id);
  if (!orderDetails) {
    orderDetails = new OrderDetailsInfo(id);
  }

  return orderDetails as OrderDetailsInfo;
}
