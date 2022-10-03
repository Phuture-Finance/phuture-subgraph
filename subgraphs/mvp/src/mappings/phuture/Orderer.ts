import { PlaceOrder, CompleteOrder, UpdateOrder } from '../../types/Orderer/Orderer';
import { loadOrCreateOrderDetails, loadOrCreateLastOrderIndex } from '../entities/Orderer';
import { Asset, Order, OrderComplete } from '../../types/schema';

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

  let order = Order.load(event.params.id.toString());
  let sellAsset = Asset.load(event.params.sellAsset.toHexString())
  let buyAsset = Asset.load(event.params.buyAsset.toHexString());
  if (order && sellAsset && buyAsset) {
    let ocId = event.transaction.hash.toHexString();
    let oc = new OrderComplete(ocId);
    oc.order = event.params.id.toString();
    oc.index = order.index;
    oc.timestamp = event.block.timestamp;

    oc.sellToken = event.params.sellAsset.toHexString();
    oc.sellTokenPrice = sellAsset.basePrice;
    oc.sellAmount = event.params.soldShares;

    oc.buyToken = event.params.buyAsset.toHexString();
    oc.buyAmount = event.params.boughtShares;
    oc.buyTokenPrice = buyAsset.basePrice;

    oc.transactionGas = event.transaction.gasPrice;
    oc.transactionFee = event.transaction.value

    oc.save();
  }
}
