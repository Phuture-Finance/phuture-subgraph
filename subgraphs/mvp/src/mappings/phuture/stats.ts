import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';

import { FACTORY_ADDRESS } from '../../../consts';
import {
  Asset,
  DailyAssetStat,
  DailyCapitalization,
  DailyIndexStat,
  DailyStat,
  HourlyIndexStat,
  Index,
  MonthlyIndexStat,
  Stat,
  WeeklyIndexStat,
  YearlyIndexStat,
  VaultController,
  VaultControllerStat,
} from '../../types/schema';
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
  }

  stat.save();

  return stat as DailyStat;
}

export function updateStat(ts: BigInt): Stat {
  let stat = Stat.load(FACTORY_ADDRESS.toString());
  if (!stat) {
    stat = new Stat(FACTORY_ADDRESS.toString());
    stat.totalValueLocked = BigDecimal.zero();

    stat.save();
  }

  updateDailyStat(ts);

  return stat as Stat;
}

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

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as HourlyIndexStat;
}

export function updateDailyCapitalisation(
  index: Index,
  ts: BigInt,
): DailyCapitalization {
  let id = index.id.concat('-').concat(getStartingDayTimestamp(ts).toString());
  let dailyCap = DailyCapitalization.load(id);

  if (!dailyCap) {
    dailyCap = new DailyCapitalization(id);
    dailyCap.index = index.id;
    dailyCap.timestamp = ts;
  }

  dailyCap.basePrice = index.basePrice;
  dailyCap.totalSupply = index.totalSupply;
  dailyCap.capitalization = index.basePrice.times(
    convertTokenToDecimal(index.totalSupply, index.decimals),
  );
  dailyCap.save();

  return dailyCap;
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
  let id = index.id.concat('-').concat(getStartingDayTimestamp(ts).toString());

  let indexStat = DailyIndexStat.load(id);
  if (!indexStat) {
    indexStat = new DailyIndexStat(id);
    indexStat.date = ts.toI32();
    indexStat.index = index.id;
  }

  indexStat.apy = index.apy;
  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as DailyIndexStat;
}

export function updateWeeklyIndexStat(
  index: Index,
  ts: BigInt,
): WeeklyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 7);
  let startTimestamp = ID * (86400 * 7);

  let indexStat = WeeklyIndexStat.load(
    index.id.concat('-').concat(ID.toString()),
  );
  if (!indexStat) {
    indexStat = new WeeklyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.apy = index.apy;
  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume;

  indexStat.save();

  return indexStat as WeeklyIndexStat;
}

export function updateMonthlyIndexStat(
  index: Index,
  ts: BigInt,
): MonthlyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 30);
  let startTimestamp = ID * 86400 * 30;

  let indexStat = MonthlyIndexStat.load(
    index.id.concat('-').concat(ID.toString()),
  );
  if (!indexStat) {
    indexStat = new MonthlyIndexStat(
      index.id.concat('-').concat(ID.toString()),
    );
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.apy = index.apy;
  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as MonthlyIndexStat;
}

export function updateYearlyIndexStat(
  index: Index,
  ts: BigInt,
): YearlyIndexStat {
  let timestamp = ts.toI32();
  let ID = timestamp / (86400 * 365);
  let startTimestamp = ID * (86400 * 365);

  let indexStat = YearlyIndexStat.load(
    index.id.concat('-').concat(ID.toString()),
  );
  if (!indexStat) {
    indexStat = new YearlyIndexStat(index.id.concat('-').concat(ID.toString()));
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.apy = index.apy;
  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.basePriceETH = index.basePriceETH;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as YearlyIndexStat;
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

  dailyAssetStat.vaultReserve = asset.vaultReserve;
  dailyAssetStat.vaultBaseReserve = asset.vaultBaseReserve;

  dailyAssetStat.save();

  return dailyAssetStat as DailyAssetStat;
}
