import { Asset, Index, IndexAsset, vToken } from "../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts/index";
import { convertTokenToDecimal, exponentToBigDecimal } from "../utils/calc";
import {
    updateDailyIndexStat, updateHalfYearIndexStat,
    updateHourlyIndexStat,
    updateMonthlyIndexStat, updateThreeMonthIndexStat,
    updateWeeklyIndexStat, updateYearlyIndexStat
} from "../mappings/phuture/stats";

export function updateCapVToken(asset: Asset): void {
    for (let i = 0; i < asset._vTokens.length; i++) {
        let vt = vToken.load(asset._vTokens[i]);
        if (!vt) continue;

        vt.capitalization = asset.basePrice.times(new BigDecimal(vt.platformTotalSupply));
        vt.save();
    }
}

// Deprecated.
export function updateOldIndexBasePriceByIndex(index: Index, ts: BigInt): void {
    if (index._assets.length == 0) return;

    index.basePrice = BigDecimal.zero();
    for (let i = 0; i < index._assets.length; i++) {
        let asset = Asset.load(index._assets[i]);
        if (!asset) continue;

        let ia = IndexAsset.load(index.id.concat('-').concat(asset.id));
        if (!ia) continue;

        let indexBasePrice = asset.basePrice.times(ia.weight.toBigDecimal().div(BigDecimal.fromString('255')));
        index.basePrice = index.basePrice.plus(indexBasePrice);
    }

    index.marketCap = convertTokenToDecimal(index.totalSupply, index.decimals).times(index.basePrice);

    index.save();

    updateHourlyIndexStat(index, ts);
    updateDailyIndexStat(index, ts);
    updateWeeklyIndexStat(index, ts);
    updateMonthlyIndexStat(index, ts);
    updateThreeMonthIndexStat(index, ts);
    updateHalfYearIndexStat(index, ts);
    updateYearlyIndexStat(index, ts);
}

// Updating the index values after changing the base price.
export function updateIndexBasePriceByAsset(asset: Asset, ts: BigInt): void {
    for (let i = 0; i < asset._indexes.length; i++) {
        let index = Index.load(asset._indexes[i]);
        if (!index) continue;

        updateIndexBasePriceByIndex(index, ts);
    }
}

export function updateIndexBasePriceByIndex(index: Index, ts: BigInt): void {
    if (index._assets.length == 0 || index.totalSupply.isZero()) return;

    let assetValue = BigDecimal.zero();

    index.basePrice = BigDecimal.zero();
    for (let i = 0; i < index._assets.length; i++) {
        let asset = Asset.load(index._assets[i]);
        if (!asset) continue;

        let ia = IndexAsset.load(index.id.concat('-').concat(asset.id));
        if (!ia) continue;

        let qAsset = ia.shares;
        for (let i2 = 0; i2 < asset._vTokens.length; i2++) {
            let vt = vToken.load(asset._vTokens[i2]);
            if (vt) {
                qAsset = qAsset.plus(vt.deposited);
            }
        }

        assetValue = assetValue.plus(convertTokenToDecimal(qAsset, asset.decimals).times(asset.basePrice));
    }

    // index.basePrice = assetValue.div(index.totalSupply.toBigDecimal());
    index.basePrice = assetValue.times(exponentToBigDecimal(index.decimals)).div(index.totalSupply.toBigDecimal());
    index.marketCap = assetValue;

    index.save();

    updateHourlyIndexStat(index, ts);
    updateDailyIndexStat(index, ts);
    updateWeeklyIndexStat(index, ts);
    updateMonthlyIndexStat(index, ts);
    updateThreeMonthIndexStat(index, ts);
    updateHalfYearIndexStat(index, ts);
    updateYearlyIndexStat(index, ts);
}
