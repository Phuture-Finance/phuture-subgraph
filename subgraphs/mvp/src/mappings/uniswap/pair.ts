import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import { BNA_ADDRESS } from '../../../consts';
import { Asset, Pair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import { convertDecimals, exponentToBigDecimal } from '../../utils/calc';

const USDC_WETH_PAIR = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc';
const DAI_WETH_PAIR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  let asset0 = Asset.load(pair.asset0);
  let asset1 = Asset.load(pair.asset1);
  if (!asset0 || !asset1) return;

  pair.asset0Reserve = new BigDecimal(event.params.reserve0);
  pair.asset1Reserve = new BigDecimal(event.params.reserve1);

  updateAssetsBasePrice(pair.asset0Reserve, pair.asset1Reserve, asset0, asset1);

  pair.save();
}

export function updateAssetsBasePrice(
  reserve0: BigDecimal,
  reserve1: BigDecimal,
  asset0: Asset,
  asset1: Asset,
): void {
  let asset0Reserve = convertDecimals(reserve0, asset0.decimals);
  let asset1Reserve = convertDecimals(reserve1, asset1.decimals);

  if ([BNA_ADDRESS].includes(asset0.id)) {
    updateAssetBasePrice(asset0, asset1, asset0Reserve, asset1Reserve);
  }

  if ([BNA_ADDRESS].includes(asset1.id)) {
    updateAssetBasePrice(asset1, asset0, asset1Reserve, asset0Reserve);
  }
}

function updateAssetBasePrice(
  base: Asset,
  quote: Asset,
  baseAssetReserve: BigDecimal,
  assetReserve: BigDecimal,
): void {
  base.basePriceUni = getEthPriceInUSD();
  base.save();

  quote.basePriceUni = baseAssetReserve
    .times(base.basePriceUni)
    .div(assetReserve);
  quote.save();
}

// TODO: why we need this?
export function handleTransfer(event: Transfer): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) return;

  if (event.params.from.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.plus(event.params.value);
  }

  if (event.params.to.equals(Address.zero())) {
    pair.totalSupply = pair.totalSupply.minus(event.params.value);
  }

  pair.save();
}

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stable-coin
  let daiPair = Pair.load(DAI_WETH_PAIR); // dai is token0
  let usdcPair = Pair.load(USDC_WETH_PAIR); // usdc is token0

  // TODO: optimize for not duplicating USDC-related code
  if (daiPair !== null && usdcPair !== null) {
    // 0 - dai, 1 - weth
    let daiPrice = daiPair.asset0Reserve.div(daiPair.asset1Reserve);
    // 0 - usdc, 1 - weth
    let asset0Reserve = usdcPair.asset0Reserve.div(
      exponentToBigDecimal(BigInt.fromU32(6)),
    );
    let asset1Reserve = usdcPair.asset1Reserve.div(
      exponentToBigDecimal(BigInt.fromU32(18)),
    );
    let usdcPrice = asset0Reserve.div(asset1Reserve);

    let totalLiquidityETH = daiPair.asset1Reserve.plus(usdcPair.asset1Reserve);
    let daiWeight = daiPair.asset1Reserve.div(totalLiquidityETH);
    let usdcWeight = usdcPair.asset1Reserve.div(totalLiquidityETH);

    return daiPrice.times(daiWeight).plus(usdcPrice.times(usdcWeight));
  } else if (usdcPair !== null) {
    let asset0Reserve = usdcPair.asset0Reserve.div(
      exponentToBigDecimal(BigInt.fromU32(6)),
    );
    let asset1Reserve = usdcPair.asset1Reserve.div(
      exponentToBigDecimal(BigInt.fromU32(18)),
    );

    return asset0Reserve.div(asset1Reserve);
  }

  return BigDecimal.zero();
}
