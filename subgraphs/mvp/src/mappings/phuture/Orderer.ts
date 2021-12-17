import { PlaceOrder, CompleteOrder, UpdateOrder } from '../../types/Orderer/Orderer';
import { loadOrCreateOrder, loadOrCreateOrderDetails, loadOrCreateOrderLink } from '../entities/Orderer';

export function handlerPlaceOrder(event: PlaceOrder): void {
  let order = loadOrCreateOrder(event.params.creator);
  order.order_id = event.params.id;
  order.index = event.params.creator.toHexString();
  order.save();

  // Since creator (Index entity) is primary key, we have to additionally store this link
  // to future events where we get only order_id but we don't know the index address
  // to set the correct link to the Order entity. @see handlerUpdateOrder
  let orderLink = loadOrCreateOrderLink(event.params.id);
  orderLink.index = event.params.creator.toHexString();
  orderLink.save();
}

export function handlerUpdateOrder(event: UpdateOrder): void {
  let orderDetails = loadOrCreateOrderDetails(event.params.id, event.params.asset);
  let orderLink = loadOrCreateOrderLink(event.params.id);

  orderDetails.order = orderLink.index;
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
