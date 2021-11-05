import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  Asset,
  DailyAssetStat,
  DailyIndexStat,
  DailyStat,
  HourlyIndexStat,
  Index,
  MonthlyIndexStat,
  Stat,
  WeeklyIndexStat,
  YearlyIndexStat
} from "../../types/schema";
import { FACTORY_ADDRESS } from "../../../consts";

export function updateDailyStat(event: ethereum.Event): DailyStat {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let stat = DailyStat.load(dayID.toString());
  if (stat === null) {
    stat = new DailyStat(dayID.toString());
    stat.date = dayStartTimestamp;
    stat.totalValueLocked = BigDecimal.zero();
    stat.indexCount = BigInt.zero();
  }

  let allTimeStat = Stat.load(FACTORY_ADDRESS.toString());
  if (allTimeStat !== null) {
    stat.indexCount = allTimeStat.indexCount;
  }

  stat.save();

  return stat as DailyStat;
}

export function updateStat(event: ethereum.Event): Stat {
  let stat = Stat.load(FACTORY_ADDRESS.toString());
  if (stat === null) {
    stat = new Stat(FACTORY_ADDRESS.toString());
    stat.totalValueLocked = BigDecimal.zero();
    stat.indexCount = BigInt.zero();

    stat.save();
  }

  updateDailyStat(event);

  return stat as Stat;
}

export function updateHourlyIndexStat(event: ethereum.Event): HourlyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let ID = timestamp / 3600;
  let startTimestamp = ID * 3600;
  let indexID = event.address.toHexString().concat("-").concat(BigInt.fromI32(ID).toString());

  let index = Index.load(event.address.toHexString());
  if (!index) {
    throw new Error("TODO");
  }

  let indexStat = HourlyIndexStat.load(indexID);
  if (indexStat === null) {
    indexStat = new HourlyIndexStat(indexID);
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

export function updateDailyIndexStat(event: ethereum.Event): DailyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let ID = timestamp / 86400;
  let startTimestamp = ID * 86400;
  let indexID = event.address.toHexString().concat("-").concat(BigInt.fromI32(ID).toString());

  let index = Index.load(event.address.toHexString());
  if (!index) {
    throw new Error("TODO");
  }
  let indexStat = DailyIndexStat.load(indexID);
  if (indexStat === null) {
    indexStat = new DailyIndexStat(indexID);
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as DailyIndexStat;
}

export function updateWeeklyIndexStat(event: ethereum.Event): WeeklyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let ID = timestamp / (86400 * 7);
  let startTimestamp = ID * (86400 * 7);
  let indexID = event.address.toHexString().concat("-").concat(BigInt.fromI32(ID).toString());

  let index = Index.load(event.address.toHexString());
  if (!index) {
    throw new Error("TODO");
  }
  let indexStat = WeeklyIndexStat.load(indexID);
  if (indexStat === null) {
    indexStat = new WeeklyIndexStat(indexID);
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as WeeklyIndexStat;
}

export function updateMonthlyIndexStat(event: ethereum.Event): MonthlyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let ID = timestamp / (86400 * 30);
  let startTimestamp = ID * 86400 * 30;
  let indexID = event.address.toHexString().concat("-").concat(BigInt.fromI32(ID).toString());

  let index = Index.load(event.address.toHexString());
  if (!index) {
    throw new Error("TODO");
  }
  let indexStat = MonthlyIndexStat.load(indexID);
  if (indexStat === null) {
    indexStat = new MonthlyIndexStat(indexID);
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as MonthlyIndexStat;
}

export function updateYearlyIndexStat(event: ethereum.Event): YearlyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let ID = timestamp / (86400 * 365);
  let startTimestamp = ID * (86400 * 365);
  let indexID = event.address.toHexString().concat("-").concat(BigInt.fromI32(ID).toString());

  let index = Index.load(event.address.toHexString());
  if (!index) {
    throw new Error("TODO");
  }
  let indexStat = YearlyIndexStat.load(indexID);
  if (indexStat === null) {
    indexStat = new YearlyIndexStat(indexID);
    indexStat.date = startTimestamp;
    indexStat.index = index.id;
  }

  indexStat.marketCap = index.marketCap;
  indexStat.uniqueHolders = index.uniqueHolders;
  indexStat.basePrice = index.basePrice; // index.basePrice;
  indexStat.baseVolume = index.baseVolume; // index.baseVolume;

  indexStat.save();

  return indexStat as YearlyIndexStat;
}

export function updateDailyAssetStat(event: ethereum.Event): DailyAssetStat | null {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayAssetID = event.address.toHexString().concat("-").concat(BigInt.fromI32(dayID).toString());

  let asset = Asset.load(event.address.toHexString());
  if (asset == null) {
    return null;
  }

  let dailyAssetStat = DailyAssetStat.load(dayAssetID);
  if (dailyAssetStat === null) {
    dailyAssetStat = new DailyAssetStat(dayAssetID);
    dailyAssetStat.date = dayStartTimestamp;
    dailyAssetStat.asset = asset.id;
  }

  dailyAssetStat.vaultReserve = asset.vaultReserve;
  dailyAssetStat.vaultBaseReserve = asset.vaultBaseReserve;

  dailyAssetStat.save();

  return dailyAssetStat as DailyAssetStat;
}
