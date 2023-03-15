import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { AggregatorInterface } from '../../types/PhuturePriceOracle/AggregatorInterface';
import { BNA_ADDRESS, ChainLinkAssetMap } from '../../../consts';
import { convertTokenToDecimal } from '../../utils/calc';

export function convertUSDToETH(usdPrice: BigDecimal): BigDecimal {
  let networkAssetPriceAggregatorContract = AggregatorInterface.bind(
    Address.fromString(ChainLinkAssetMap.mustGet(BNA_ADDRESS)),
  );
  let networkAssetPrice = convertTokenToDecimal(
    networkAssetPriceAggregatorContract.latestAnswer(),
    BigInt.fromI32(8), // Either hardcode or call decimals() on the contract.
  );
  return usdPrice.div(networkAssetPrice);
}
