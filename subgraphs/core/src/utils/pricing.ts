import { AggregatorInterface } from '../types/PhuturePriceOracle/AggregatorInterface';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS, BNA_ADDRESS, ChainLinkAssetMap } from '../../consts';
import { convertTokenToDecimal, exponentToBigDecimal } from './calc';
import { BigDecimal } from '@graphprotocol/graph-ts/index';
import { PhuturePriceOracle } from '../types/PhuturePriceOracle/PhuturePriceOracle';
import { Asset } from '../types/schema';

export function getBasePrice(): BigDecimal {
  let basePriceAggregatorContract = AggregatorInterface.bind(
    Address.fromString(ChainLinkAssetMap.mustGet(BASE_ADDRESS)),
  );
  return convertTokenToDecimal(
    basePriceAggregatorContract.latestAnswer(),
    BigInt.fromI32(8), // Either hardcode or call decimals() on the contract.
  );
}

export function getAssetPrice(
  phuturePriceOracle: PhuturePriceOracle,
  asset: Asset,
  basePrice: BigDecimal,
): BigDecimal {
  let assetPriceInUQ = phuturePriceOracle.try_lastAssetPerBaseInUQ(
    Address.fromString(asset.id),
  );
  if (!assetPriceInUQ.reverted) {
    let Q112 = new BigDecimal(
      BigInt.fromString('5192296858534827628530496329220096'),
    );

    return Q112.times(exponentToBigDecimal(asset.decimals))
      .times(exponentToBigDecimal(BigInt.fromI32(6))) // TODO: setup 6, don't hardcode it
      .times(basePrice)
      .div(new BigDecimal(assetPriceInUQ.value));
  }
  return BigDecimal.zero();
}

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
