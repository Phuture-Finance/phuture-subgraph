import { PlaceOrder, CompleteOrder, UpdateOrder } from '../../types/Orderer/Orderer';
import { loadOrCreateOrder, loadOrCreateOrderDetails } from '../entities/Orderer';

export function handlerPlaceOrder(event: PlaceOrder): void {
  let order = loadOrCreateOrder(event.params.creator);
  order.order_id = event.params.id;
  order.save();
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
