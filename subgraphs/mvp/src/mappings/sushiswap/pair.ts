import { Asset, SushiPair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import { convertTokenToDecimal } from '../entities';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { BASE_ADDRESS } from '../../../consts';

export function handleSync(event: Sync): void {
    let sp = SushiPair.load(event.address.toHexString());
    if (!sp) return;

    let asset0 = Asset.load(sp.asset0);
    let asset1 = Asset.load(sp.asset1);
    if (!asset0 || !asset1) return;

    sp.asset0Reserve = new BigDecimal(event.params.reserve0);
    sp.asset1Reserve = new BigDecimal(event.params.reserve1);

    updateSushiAssetsBasePrice(event.params.reserve0, event.params.reserve1, asset0, asset1, event.block.timestamp);

    sp.save();
}


export function updateSushiAssetsBasePrice(reserve0: BigInt, reserve1: BigInt, asset0: Asset, asset1: Asset, ts: BigInt): void {
    let asset0Reserve = convertTokenToDecimal(reserve0, asset0.decimals);
    let asset1Reserve = convertTokenToDecimal(reserve1, asset1.decimals);

    if (asset0.id == BASE_ADDRESS) {
        updateSushiAssetBasePrice(asset0, asset1, asset0Reserve, asset1Reserve, ts);
    }

    if (asset1.id == BASE_ADDRESS) {
        updateSushiAssetBasePrice(asset1, asset0, asset1Reserve, asset0Reserve, ts);
    }
}


function updateSushiAssetBasePrice(
    baseAsset: Asset,
    asset: Asset,
    baseAssetReserve: BigDecimal,
    assetReserve: BigDecimal,
    ts: BigInt
): void {
    if (baseAsset.basePriceSushi.equals(BigDecimal.zero())) {
        baseAsset.basePriceSushi = new BigDecimal(BigInt.fromI32(1));
        baseAsset.save();
    }

    asset.basePriceSushi = assetReserve.div(baseAssetReserve);
    asset.save();

    /*
        p = Q_base / Q_quote
        p_s = Q_stablecoin / Q_base
        q_stablecoin_per_quote = p * p_s
        totalLiquidity = sum(q_stablecoin_per_quote)
        w_i = q_stablecoin_per_quote / q_stablecoin_per_quote
    */
}


export function handleTransfer(event: Transfer): void {
    let sp = SushiPair.load(event.address.toHexString());
    if (sp) {
        if (event.params.from.equals(Address.zero())) {
            sp.totalSupply = sp.totalSupply.plus(event.params.value);
        }

        if (event.params.to.equals(Address.zero())) {
            sp.totalSupply = sp.totalSupply.minus(event.params.value);
        }

        sp.save();
    }
}

/*
export function getEthPriceInUSD(): BigDecimal {
    // fetch eth prices for each stable coin
    let daiPair = SushiPair.load(DAI_WETH_PAIR) // dai is token0
    let usdcPair = SushiPair.load(USDC_WETH_PAIR) // usdc is token0
    let usdtPair = SushiPair.load(USDT_WETH_PAIR) // usdt is token1

    // all 3 have been created
    if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
        let totalLiquidityETH = daiPair.asset1Reserve.plus(usdcPair.asset1Reserve).plus(usdtPair.asset0Reserve)
        let daiWeight = daiPair.asset1Reserve.div(totalLiquidityETH)
        let usdcWeight = usdcPair.asset1Reserve.div(totalLiquidityETH)
        let usdtWeight = usdtPair.asset0Reserve.div(totalLiquidityETH)
        return daiPair.token0Price
            .times(daiWeight)
            .plus(usdcPair.token0Price.times(usdcWeight))
            .plus(usdtPair.token1Price.times(usdtWeight))
        // dai and USDC have been created
    } else if (daiPair !== null && usdcPair !== null) {
        let totalLiquidityETH = daiPair.asset1Reserve.plus(usdcPair.asset1Reserve)
        let daiWeight = daiPair.asset1Reserve.div(totalLiquidityETH)
        let usdcWeight = usdcPair.asset1Reserve.div(totalLiquidityETH)
        return daiPair.token0Price.times(daiWeight).plus(usdcPair.token0Price.times(usdcWeight))
        // USDC is the only pair so far
    } else if (usdcPair !== null) {
        return usdcPair.token0Price
    } else {
        return BigDecimal.zero()
    }
}

*/
