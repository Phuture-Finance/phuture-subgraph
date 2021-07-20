/* eslint-disable prefer-const */
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { DailyIndexStat, Index, Stat } from "../types/schema";
import { ZERO_BD } from "./helpers";

export function updateStat(event: ethereum.Event): Stat {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let stat = Stat.load(dayID.toString());
  if (stat === null) {
    stat = new Stat(dayID.toString());
    stat.date = dayStartTimestamp;
    stat.totalValueLocked = ZERO_BD;

    stat.save();
  }

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

  dailyIndexStat.marketCap = index.marketCap;
  dailyIndexStat.uniqueHolders = BigInt.fromI32(index.users.length);
  dailyIndexStat.basePrice = ZERO_BD; // index.basePrice;
  dailyIndexStat.baseVolume = ZERO_BD; // index.baseVolume;

  dailyIndexStat.save();

  return dailyIndexStat as DailyIndexStat;
}
