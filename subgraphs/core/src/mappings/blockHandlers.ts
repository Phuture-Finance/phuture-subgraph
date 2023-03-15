import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  log,
} from '@graphprotocol/graph-ts';
import { Index, Asset, IndexAsset, vToken } from '../types/schema';
import { PhuturePriceOracle } from '../types/PhuturePriceOracle/PhuturePriceOracle';
import { convertTokenToDecimal, exponentToBigDecimal } from '../utils/calc';
import { convertUSDToETH } from './entities';
import { updateDailyIndexStat, updateHourlyIndexStat } from './phuture/stats';

export function handleBlockUpdatePrices(block: ethereum.Block): void {
  // TODO: query every nBlocks
  let phuturePriceOracleContract = PhuturePriceOracle.bind(
    Address.fromString(''),
  ); // TODO return address from constants
  let index = Index.load(''); // TODO: fetch the index from the constants
  if (!index) {
    log.error('Index not found', ['PDI']); // Index name
    return;
  }

  const assets = index._assets;
  if (assets.length == 0) {
    log.error('Index has no assets', ['PDI']); // Index name
    return;
  }

  let totalAssets = BigDecimal.zero();

  // APY * assetQuantityInUSD / totalCapitalizationInUSD * depositedAssetQuantity / totalAssetQuantity

  // TODO: just fetch the price of USC/USD and use that one.
  // TODO: also use this to update the USV marketCap and basePrice

  index.basePrice = BigDecimal.zero();
  index.apy = BigDecimal.zero();

  for (let i = 0; i < assets.length; i++) {
    let asset = Asset.load(assets[i]);
    if (!asset) continue;

    let indexAsset = IndexAsset.load(index.id.concat('-').concat(asset.id));
    if (!indexAsset) continue;

    let assetPriceInUQ = phuturePriceOracleContract.try_lastAssetPerBaseInUQ(
      Address.fromString(asset.id),
    );
    if (!assetPriceInUQ.reverted) {
      let Q112 = new BigDecimal(
        BigInt.fromString('5192296858534827628530496329220096'),
      );

      // Update the base price of the asset
      asset.basePrice = Q112.times(exponentToBigDecimal(asset.decimals))
        .times(exponentToBigDecimal(BigInt.fromI32(6))) // TODO: setup 6, not harcode
        .div(new BigDecimal(assetPriceInUQ.value));

      // TOD0: handle conversion from USDC to USD
    }

    asset.save();

    // TOD0 save the asset here

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

  updateHourlyIndexStat(index, block.timestamp);
  updateDailyIndexStat(index, block.timestamp);
}
