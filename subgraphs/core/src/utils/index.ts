import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

import { convertUSDToETH } from '../mappings/entities';
import {
  updateDailyIndexStat,
  updateHourlyIndexStat,
} from '../mappings/phuture/stats';
import { Asset, Index, IndexAsset, vToken } from '../types/schema';

import { convertTokenToDecimal, exponentToBigDecimal } from './calc';
import { Address, log } from '@graphprotocol/graph-ts';
import { PhuturePriceOracle } from '../types/PhuturePriceOracle/PhuturePriceOracle';
import { AggregatorInterface } from '../types/PhuturePriceOracle/AggregatorInterface';
import {
  BASE_ADDRESS,
  ChainLinkAssetMap,
  PHUTURE_PRICE_ORACLE,
} from '../../consts';
import { getAssetPrice, getBasePrice } from './pricing';

export function updateAllIndexPrices(index: Index, ts: BigInt): void {
  const assets = index._assets;
  if (assets.length == 0 || index.totalSupply.isZero()) {
    log.error('Index has no assets', [index.id]); // Index name
    return;
  }

  let phuturePriceOracle = PhuturePriceOracle.bind(
    Address.fromString(PHUTURE_PRICE_ORACLE),
  );
  let basePrice = getBasePrice();

  let totalAssets = BigDecimal.zero();

  // APY * assetQuantityInUSD / totalCapitalizationInUSD * depositedAssetQuantity / totalAssetQuantity
  index.basePrice = BigDecimal.zero();
  index.apy = BigDecimal.zero();

  for (let i = 0; i < assets.length; i++) {
    let asset = Asset.load(assets[i]);
    if (!asset) continue;

    let indexAsset = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if (!indexAsset) continue;

    let assetPrice = getAssetPrice(phuturePriceOracle, asset, basePrice);
    if (assetPrice.notEqual(BigDecimal.zero())) {
      asset.basePrice = assetPrice;
      asset.save();
    }

    let reserve = BigInt.fromI32(0);
    for (let j = 0; j < asset._vTokens.length; j++) {
      let vt = vToken.load(asset._vTokens[j]);
      if (vt && !vt.platformTotalSupply.isZero()) {
        reserve = indexAsset.shares
          .times(vt.totalAmount)
          .div(vt.platformTotalSupply);

        if (index.marketCap.notEqual(BigDecimal.zero())) {
          // Index_APY = sum(i => APY_of_utilized_i * Q_constituent_i / totalMarketCap)

          let assetQuantityInUSD = convertTokenToDecimal(
            vt.totalAmount,
            asset.decimals,
          ).times(asset.basePrice);
          // Index_APY = sum(i => APY_i * Q_utilized / totalMarketCap)
          index.apy = index.apy.plus(
            vt.apy.times(assetQuantityInUSD.div(index.marketCap)),
          );
        }
      }
    }

    totalAssets = totalAssets.plus(
      convertTokenToDecimal(reserve, asset.decimals).times(asset.basePrice),
    );
  }

  index.basePrice = totalAssets
    .times(exponentToBigDecimal(index.decimals))
    .div(index.totalSupply.toBigDecimal());
  index.basePriceETH = convertUSDToETH(index.basePrice);
  index.marketCap = totalAssets;

  index.save();

  updateHourlyIndexStat(index, ts);
  updateDailyIndexStat(index, ts);
}
