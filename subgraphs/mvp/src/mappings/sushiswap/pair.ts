import { Asset, SushiPair } from '../../types/schema';
import { Sync, Transfer } from '../../types/templates/UniswapPair/UniswapPair';
import {convertTokenToDecimal, exponentToBigDecimal} from '../entities';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS } from '../../../consts';

const USDC_WETH_PAIR = '0x397ff1542f962076d0bfe58ea045ffa2d347aca0';
const DAI_WETH_PAIR = '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f';

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

    if ([WETH_ADDRESS].includes(asset0.id)) {
        updateSushiAssetBasePrice(asset0, asset1, asset0Reserve, asset1Reserve, ts);
    }

    if ([WETH_ADDRESS].includes(asset1.id)) {
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
    baseAsset.basePriceSushi = getEthPriceInUSD();
    baseAsset.save();

    asset.basePriceSushi = baseAssetReserve.div(assetReserve).times(baseAsset.basePriceSushi);
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

export function getEthPriceInUSD(): BigDecimal {
    // fetch eth prices for each stablecoin
    let daiPair = SushiPair.load(DAI_WETH_PAIR); // dai is token0
    let usdcPair = SushiPair.load(USDC_WETH_PAIR); // usdc is token0

    if (daiPair !== null && usdcPair !== null) {
        // 0 - dai, 1 - weth
        let daiPrice = daiPair.asset0Reserve.div(daiPair.asset1Reserve);
        // 0 - usdc, 1 - weth
        let asset0Reserve = usdcPair.asset0Reserve.div(exponentToBigDecimal(BigInt.fromU32(6)));
        let asset1Reserve = usdcPair.asset1Reserve.div(exponentToBigDecimal(BigInt.fromU32(18)));
        let usdcPrice = asset0Reserve.div(asset1Reserve);

        let totalLiquidityETH = daiPair.asset1Reserve.plus(usdcPair.asset1Reserve);
        let daiWeight = daiPair.asset1Reserve.div(totalLiquidityETH);
        let usdcWeight = usdcPair.asset1Reserve.div(totalLiquidityETH);

        return daiPrice.times(daiWeight).plus(usdcPrice.times(usdcWeight));

        // USDC is the only pair so far
    } else if (usdcPair !== null) {
        return usdcPair.asset1Reserve.div(usdcPair.asset0Reserve);
    } else {
        return BigDecimal.zero();
    }
}
