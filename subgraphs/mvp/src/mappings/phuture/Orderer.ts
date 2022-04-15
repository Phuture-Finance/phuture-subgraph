import { PlaceOrder, CompleteOrder, UpdateOrder } from '../../types/Orderer/Orderer';
import { loadOrCreateOrderDetails, loadOrCreateLastOrderIndex } from '../entities/Orderer';
import { Order } from '../../types/schema';

export function handlerPlaceOrder(event: PlaceOrder): void {
  // let order = loadOrCreateOrder(event.params.creator);

  let order = new Order(event.params.id.toString());
  order.order_id = event.params.id;
  order.index = event.params.creator.toHexString();
  order.save();

  let lastOrderIndex = loadOrCreateLastOrderIndex(event.params.creator);
  lastOrderIndex.index = event.params.creator.toHexString();
  lastOrderIndex.order = event.params.id.toString();
  lastOrderIndex.save();
}

export function handlerUpdateOrder(event: UpdateOrder): void {
  let orderDetails = loadOrCreateOrderDetails(event.params.id, event.params.asset);

  orderDetails.order = event.params.id.toString();
  orderDetails.asset = event.params.asset.toHexString();
  orderDetails.shares = event.params.share;
  orderDetails.side = event.params.isSellSide ? 'Sell' : 'Buy';

  orderDetails.save();
}

export function handlerCompleteOrder(event: CompleteOrder): void {
  let buyOrderDetails = loadOrCreateOrderDetails(event.params.id, event.params.buyAsset);
  buyOrderDetails.shares = buyOrderDetails.shares.minus(event.params.boughtShares);
  buyOrderDetails.save();

  let sellOrderDetails = loadOrCreateOrderDetails(event.params.id, event.params.sellAsset);
  sellOrderDetails.shares = sellOrderDetails.shares.minus(event.params.soldShares);
  sellOrderDetails.save();
}
