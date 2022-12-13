import {BigDecimal, BigInt, ethereum} from '@graphprotocol/graph-ts';

import {
    Asset,
    DailyAssetStat,
    DailyIndexStat,
    SVDailyStat,
    SVVault,
    HourlyIndexStat,
    Index,
    VaultController,
    VaultControllerStat,
} from '../../types/schema';
import {convertTokenToDecimal} from '../../utils/calc';
import {getStartingDayTimestamp} from '../../utils/timestamp';

export function updateHourlyIndexStat(
    index: Index,
    ts: BigInt,
): HourlyIndexStat {
    let timestamp = ts.toI32();
    let ID = timestamp / 3600;
    let startTimestamp = ID * 3600;

    let indexStat = HourlyIndexStat.load(
        index.id.concat('-').concat(ID.toString()),
    );
    if (!indexStat) {
        indexStat = new HourlyIndexStat(index.id.concat('-').concat(ID.toString()));
        indexStat.date = startTimestamp;
        indexStat.index = index.id;
    }

    indexStat.basePrice = index.basePrice;
    indexStat.marketCap = index.marketCap;
    indexStat.uniqueHolders = index.uniqueHolders;

    indexStat.save();

    return indexStat as HourlyIndexStat;
}

export function updateSVDailyStat(vault: SVVault, ts: BigInt): SVDailyStat {
    let startingDay = getStartingDayTimestamp(ts);

    let stat = SVDailyStat.load(
        vault.id.concat('-').concat(startingDay.toString()),
    );
    if (!stat) {
        stat = new SVDailyStat(vault.id.concat('-').concat(startingDay.toString()));
        stat.date = startingDay;
        stat.vault = vault.id;
    }

    stat.marketCap = vault.basePrice.times(
        convertTokenToDecimal(vault.totalSupply, vault.decimals),
    );
    stat.totalSupply = vault.totalSupply;
    stat.uniqueHolders = vault.uniqueHolders;
    stat.basePrice = vault.basePrice;
    stat.basePriceETH = vault.basePriceETH;
    stat.apy = vault.apy;

    stat.save();

    return stat as SVDailyStat;
}

export function updateVaultControllerDailyStat(
    vc: VaultController,
    apy: BigDecimal,
    dp: BigInt,
    ts: BigInt,
): VaultControllerStat {
    let stat = VaultControllerStat.load(vc.id.concat('-').concat(ts.toString()));
    if (!stat) {
        stat = new VaultControllerStat(vc.id.concat('-').concat(ts.toString()));
        stat.date = ts;
        stat.vaultController = vc.id;
    }

    stat.apy = apy;
    stat.depositedPercentage = dp;
    stat.withdraw = vc.withdraw;
    stat.withdrawnAt = vc.withdrawnAt;
    stat.deposit = vc.deposit;
    stat.depositedAt = vc.depositedAt;

    stat.save();

    return stat;
}

export function updateDailyIndexStat(index: Index, ts: BigInt): DailyIndexStat {
    let startingDay = getStartingDayTimestamp(ts);
    let id = index.id.concat('-').concat(startingDay.toString());

    let indexStat = DailyIndexStat.load(id);
    if (!indexStat) {
        indexStat = new DailyIndexStat(id);
        indexStat.date = startingDay.toI32();
        indexStat.index = index.id;
    }
    indexStat.apy = index.apy;
    indexStat.marketCap = index.basePrice.times(
        convertTokenToDecimal(index.totalSupply, index.decimals),
    );
    indexStat.totalSupply = index.totalSupply;
    indexStat.uniqueHolders = index.uniqueHolders;
    indexStat.basePrice = index.basePrice;
    indexStat.basePriceETH = index.basePriceETH;

    indexStat.save();

    return indexStat as DailyIndexStat;
}

export function updateDailyAssetStat(
    event: ethereum.Event,
    asset: Asset,
): DailyAssetStat | null {
    let timestamp = event.block.timestamp.toI32();
    let dayID = timestamp / 86400;
    let dayStartTimestamp = dayID * 86400;
    let dayAssetID = asset.id
        .concat('-')
        .concat(BigInt.fromI32(dayID).toString());

    let dailyAssetStat = DailyAssetStat.load(dayAssetID);
    if (!dailyAssetStat) {
        dailyAssetStat = new DailyAssetStat(dayAssetID);
        dailyAssetStat.date = dayStartTimestamp;
        dailyAssetStat.asset = asset.id;
    }

    dailyAssetStat.save();

    return dailyAssetStat as DailyAssetStat;
}
