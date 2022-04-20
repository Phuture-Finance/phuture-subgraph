import {BigDecimal, BigInt} from '@graphprotocol/graph-ts/index';
import {SushiPair} from '../types/schema';
import { exponentToBigDecimal } from '../mappings/entities';

export function getEthPriceInUSD(usdc: string, dai: string): BigDecimal {
    // Fetch eth prices for each stableCoin.
    let daiPair = SushiPair.load(dai); // dai is token0
    let usdcPair = SushiPair.load(usdc); // usdc is token0

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