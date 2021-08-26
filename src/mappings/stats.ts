/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { Asset, DailyAssetStat, DailyIndexStat, DailyStat, Index, IndexStat, Stat } from '../types/schema'
import { ONE_BI, ZERO_BD, ZERO_BI } from './helpers'
import { FACTORY_ADDRESS } from "../consts";

export function updateDailyStat(event: ethereum.Event): DailyStat {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let stat = DailyStat.load(dayID.toString());
  if (stat === null) {
    stat = new DailyStat(dayID.toString());
    stat.date = dayStartTimestamp;
    stat.totalValueLocked = ZERO_BD;
    stat.indexCount = ZERO_BI;
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
    stat.totalValueLocked = ZERO_BD;
    stat.indexCount = ZERO_BI;

    stat.save();
  }

  updateDailyStat(event);

  return stat as Stat;
}

export function updateDailyIndexStat(event: ethereum.Event): DailyIndexStat {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayIndexID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());

  let index = Index.load(event.address.toHexString());
  let dailyIndexStat = DailyIndexStat.load(dayIndexID);
  if (dailyIndexStat === null) {
    dailyIndexStat = new DailyIndexStat(dayIndexID);
    dailyIndexStat.date = dayStartTimestamp;
    dailyIndexStat.index = index.id;
  }

  let allTimeIndexStat = IndexStat.load(event.address.toHexString());

  let basePrice = BigDecimal.fromString('0');
  let assets = index.assets;
  for (let i = 0; i < assets.length; i++) {
    let asset = Asset.load(assets[i].toString())
    basePrice = basePrice.plus(asset.basePrice);
  }

  dailyIndexStat.uniqueHolders = allTimeIndexStat.uniqueHolders;
  dailyIndexStat.basePrice = allTimeIndexStat.basePrice;
  dailyIndexStat.baseVolume = allTimeIndexStat.baseVolume;
  dailyIndexStat.marketCap = allTimeIndexStat.marketCap;

  dailyIndexStat.save();

  return dailyIndexStat as DailyIndexStat;
}

export function updateDailyAssetStat(event: ethereum.Event): DailyAssetStat | null {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayAssetID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());

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
  dailyAssetStat.basePrice = asset.basePrice;

  dailyAssetStat.save();

  return dailyAssetStat as DailyAssetStat;
}
