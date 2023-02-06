import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

import { convertUSDToETH } from '../mappings/entities';
import {
  updateDailyIndexStat,
  updateHourlyIndexStat,
} from '../mappings/phuture/stats';
import { Asset, Index, IndexAsset, vToken } from '../types/schema';

import { convertTokenToDecimal, exponentToBigDecimal } from './calc';

// Updating the index values after changing the base price.
export function updateIndexBasePriceByAsset(asset: Asset, ts: BigInt): void {
  for (let i = 0; i < asset._indexes.length; i++) {
    let index = Index.load(asset._indexes[i]);
    if (index) {
      updateIndexBasePriceByIndex(index, ts);
    }
  }
}

export function updateIndexBasePriceByIndex(index: Index, ts: BigInt): void {
  if (index._assets.length == 0 || index.totalSupply.isZero()) return;

  let assetValue = BigDecimal.zero();

  // APY * assetQuantityInUSD / totalCapitalizationInUSD * depositedAssetQuantity / totalAssetQuantity

  index.basePrice = BigDecimal.zero();
  index.apy = BigDecimal.zero();

  for (let i = 0; i < index._assets.length; i++) {
    let asset = Asset.load(index._assets[i]);
    if (!asset) continue;

    let indexAsset = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if (!indexAsset) continue;

    let reserve = BigInt.fromI32(0);
    for (let i2 = 0; i2 < asset._vTokens.length; i2++) {
      let vt = vToken.load(asset._vTokens[i2]);
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

    assetValue = assetValue.plus(
      convertTokenToDecimal(reserve, asset.decimals).times(asset.basePrice),
    );
  }

  // index.basePrice = assetValue.div(index.totalSupply.toBigDecimal());
  index.basePrice = assetValue
    .times(exponentToBigDecimal(index.decimals))
    .div(index.totalSupply.toBigDecimal());
  index.basePriceETH = convertUSDToETH(index.basePrice);
  index.marketCap = assetValue;

  index.save();

  updateHourlyIndexStat(index, ts);
  updateDailyIndexStat(index, ts);
}
