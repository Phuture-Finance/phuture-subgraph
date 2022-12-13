import {
  PlaceOrder,
  CompleteOrder,
  UpdateOrder,
} from '../../types/Orderer/Orderer';
import { Asset, Order, OrderComplete } from '../../types/schema';
import {
  loadOrCreateOrderDetails,
  loadOrCreateLastOrderIndex,
} from '../entities';

export function handlerPlaceOrder(event: PlaceOrder): void {
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
  let orderDetails = loadOrCreateOrderDetails(
    event.params.id,
    event.params.asset,
  );

  orderDetails.order = event.params.id.toString();
  orderDetails.asset = event.params.asset.toHexString();
  orderDetails.shares = event.params.share;
  orderDetails.side = event.params.isSellSide ? 'Sell' : 'Buy';

  orderDetails.save();
}

export function handlerCompleteOrder(event: CompleteOrder): void {
  let buyOrderDetails = loadOrCreateOrderDetails(
    event.params.id,
    event.params.buyAsset,
  );
  buyOrderDetails.shares = buyOrderDetails.shares.minus(
    event.params.boughtShares,
  );

  buyOrderDetails.save();

  let sellOrderDetails = loadOrCreateOrderDetails(
    event.params.id,
    event.params.sellAsset,
  );
  sellOrderDetails.shares = sellOrderDetails.shares.minus(
    event.params.soldShares,
  );

  sellOrderDetails.save();

  let order = Order.load(event.params.id.toString());
  let sellAsset = Asset.load(event.params.sellAsset.toHexString());
  let buyAsset = Asset.load(event.params.buyAsset.toHexString());
  if (order && sellAsset && buyAsset) {
    let orderCompleteId = event.transaction.hash.toHexString();
    let orderComplete = new OrderComplete(orderCompleteId);
    orderComplete.order = event.params.id.toString();
    orderComplete.index = order.index;
    orderComplete.timestamp = event.block.timestamp;

    orderComplete.sellToken = event.params.sellAsset.toHexString();
    orderComplete.sellTokenPrice = sellAsset.basePrice;
    orderComplete.sellAmount = event.params.soldShares;

    orderComplete.buyToken = event.params.buyAsset.toHexString();
    orderComplete.buyAmount = event.params.boughtShares;
    orderComplete.buyTokenPrice = buyAsset.basePrice;

    orderComplete.transactionGas = event.transaction.gasPrice;
    orderComplete.transactionFee = event.transaction.value;

    orderComplete.save();
  }
}
