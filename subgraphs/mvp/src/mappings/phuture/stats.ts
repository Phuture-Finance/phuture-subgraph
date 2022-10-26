import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';

import {
  Asset,
  DailyAssetStat,
  DailyCapitalization,
  DailyIndexStat,
  DailyStat,
  SVDailyCapitalization,
  SVDailyStat,
  SVVault,
  HourlyIndexStat,
  Index,
  MonthlyIndexStat,
  Stat,
  WeeklyIndexStat,
  YearlyIndexStat,
} from '../../types/schema';
import { FACTORY_ADDRESS } from '../../../consts';
import { convertTokenToDecimal } from '../../utils/calc';
import { getStartingDayTimestamp } from '../../utils/timestamp';

export function updateDailyStat(ts: BigInt): DailyStat {
  let timestamp = ts.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let stat = DailyStat.load(dayID.toString());
  if (!stat) {
    stat = new DailyStat(dayID.toString());
    stat.date = dayStartTimestamp;
    stat.totalValueLocked = BigDecimal.zero();
    stat.indexCount = BigInt.zero();
  }

  let allTimeStat = Stat.load(FACTORY_ADDRESS.toString());
  if (allTimeStat) {
    stat.indexCount = allTimeStat.indexCount;
  }

  stat.save();

  return stat as DailyStat;
}

export function updateStat(ts: BigInt): Stat {
  let stat = Stat.load(FACTORY_ADDRESS.toString());
  if (!stat) {
    stat = new Stat(FACTORY_ADDRESS.toString());
    stat.totalValueLocked = BigDecimal.zero();
    stat.indexCount = BigInt.zero();

    stat.save();
  }

  updateDailyStat(ts);

  return stat as Stat;
}

export function updateHourlyIndexStat(index: Index, ts: BigInt): HourlyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / 3600;
  let startTimestamp = ID * 3600;

  let indexStat = HourlyIndexStat.load(index.id.concat('-').concat(ID.toString()));
  if (!indexStat) {
    indexStat = new HourlyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as HourlyIndexStat;
}

export function updateDailyCapitalisation(index: Index, ts: BigInt): DailyCapitalization {
  let id = index.id.concat('-').concat(getStartingDayTimestamp(ts).toString());
  let dailyCap = DailyCapitalization.load(id);

  if (!dailyCap) {
    dailyCap = new DailyCapitalization(id);
    dailyCap.index = index.id;
    dailyCap.timestamp = ts;
  }

  dailyCap.basePrice = index.basePrice;
  dailyCap.totalSupply = index.totalSupply;
  dailyCap.capitalization = index.basePrice.times(convertTokenToDecimal(index.totalSupply, index.decimals));
  dailyCap.save();

  return dailyCap;
}

export function updateSVDailyCapitalisation(vault: SVVault, ts: BigInt): SVDailyCapitalization {
  let id = vault.id.concat('-').concat(getStartingDayTimestamp(ts).toString());

  let dailyCap = SVDailyCapitalization.load(id);
  if (!dailyCap) {
    dailyCap = new SVDailyCapitalization(id);
    dailyCap.vault = vault.id;
    dailyCap.timestamp = ts;
  }

  dailyCap.basePrice = vault.basePrice;
  dailyCap.totalSupply = vault.totalSupply;
  dailyCap.capitalization = vault.basePrice.times(convertTokenToDecimal(vault.totalSupply, vault.decimals));
  dailyCap.save();

  return dailyCap;
}

export function updateSVDailyStat(vault: SVVault, ts: BigInt): SVDailyStat {
  let startingDay = getStartingDayTimestamp(ts);

  let stat = SVDailyStat.load(vault.id.concat('-').concat(startingDay.toString()));
  if (!stat) {
    stat = new SVDailyStat(vault.id.concat('-').concat(startingDay.toString()));
    stat.date = startingDay;
    stat.vault = vault.id;
  }

  stat.marketCap = vault.marketCap;
  stat.uniqueHolders = vault.uniqueHolders;
  stat.basePrice = vault.basePrice;
  stat.basePriceETH = vault.basePriceETH;

  stat.save();

  return stat as SVDailyStat;
}

export function updateDailyIndexStat(index: Index, ts: BigInt): DailyIndexStat {
  let id = index.id.concat('-').concat(getStartingDayTimestamp(ts).toString());

  let indexStat = DailyIndexStat.load(id);
  if (!indexStat) {
    indexStat = new DailyIndexStat(id);
    indexStat.date = ts.toI32();
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as DailyIndexStat;
}

export function updateWeeklyIndexStat(index: Index, ts: BigInt): WeeklyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 7);
  let startTimestamp = ID * (86400 * 7);

  let indexStat = WeeklyIndexStat.load(index.id.concat('-').concat(ID.toString()));
  if (!indexStat) {
    indexStat = new WeeklyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as WeeklyIndexStat;
}

export function updateMonthlyIndexStat(index: Index, ts: BigInt): MonthlyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 30);
  let startTimestamp = ID * 86400 * 30;

  let indexStat = MonthlyIndexStat.load(index.id.concat('-').concat(ID.toString()));
  if (!indexStat) {
    indexStat = new MonthlyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as MonthlyIndexStat;
}

export function updateYearlyIndexStat(index: Index, ts: BigInt): YearlyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 365);
  let startTimestamp = ID * (86400 * 365);

  let indexStat = YearlyIndexStat.load(index.id.concat('-').concat(ID.toString()));
  if (!indexStat) {
    indexStat = new YearlyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as YearlyIndexStat;
}

export function updateDailyAssetStat(event: ethereum.Event, asset: Asset): DailyAssetStat | null {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayAssetID = asset.id.concat('-').concat(BigInt.fromI32(dayID).toString());

  let dailyAssetStat = DailyAssetStat.load(dayAssetID);
  if (!dailyAssetStat) {
    dailyAssetStat = new DailyAssetStat(dayAssetID);
    dailyAssetStat.date = dayStartTimestamp;
    dailyAssetStat.asset = asset.id;
  }

  dailyAssetStat.vaultReserve = asset.vaultReserve;
  dailyAssetStat.vaultBaseReserve = asset.vaultBaseReserve;

  dailyAssetStat.save();

  return dailyAssetStat as DailyAssetStat;
}
