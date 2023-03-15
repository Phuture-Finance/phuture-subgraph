import { BigDecimal } from '@graphprotocol/graph-ts';

export function convertUSDToETH(usdPrice: BigDecimal): BigDecimal {
  // TODO: see where this is being used to convert USDC to ETH and implement it. Also move to another file.
  // let aggregator = loadOrCreateChainLink(
  //   Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)),
  // );
  // if (!aggregator.asset) {
  //   aggregator.asset = BNA_ADDRESS;
  //   aggregator.save();
  // }
  //
  // return usdPrice.div(
  //   convertTokenToDecimal(aggregator.answer, aggregator.decimals),
  // );
  return BigDecimal.zero();
}
