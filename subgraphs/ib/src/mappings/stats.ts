import {IndexBetting, IndexBettingDailyStat} from "../types/schema";
import {Address, BigInt} from '@graphprotocol/graph-ts';
import {IndexBetting as IndexBettingContract} from "../types/IndexBetting/IndexBetting";

export function updateIndexBettingDailyStat(indexBetting: IndexBetting, ts: BigInt): IndexBettingDailyStat {
  let startingDay = getStartingDayTimestamp(ts);

  let stat = IndexBettingDailyStat.load(indexBetting.id.concat("-").concat(startingDay.toString()));
  if (!stat) {
    stat = new IndexBettingDailyStat(indexBetting.id.concat('-').concat(startingDay.toString()));
    stat.date = startingDay;
    stat.indexBetting = indexBetting.id;
  }

  let indexBettingContract = IndexBettingContract.bind(Address.fromString(indexBetting.id));
  let PDIBasePrice = indexBettingContract.try_getLatestPDIPrice();
  if(!PDIBasePrice.reverted) {
    stat.PDIBasePrice = PDIBasePrice.value;
  }
  let DPIBasePrice = indexBettingContract.try_getLatestDPIPrice();
  if (!DPIBasePrice.reverted) {
    stat.DPIBasePrice = DPIBasePrice.value;
  }

  // used for testing purposes
  // stat.PDIBasePrice = BigInt.fromI32(860000);
  // stat.DPIBasePrice = BigInt.fromI32(870000);

  stat.save();
  return stat as IndexBettingDailyStat;
}

// Temporary added to have more smooth charts until hourly is not implemented.
const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24)

export function getStartingDayTimestamp(timestamp: BigInt): BigInt {
  let dayID = timestamp.div(SECONDS_IN_DAY);

  return dayID.times(SECONDS_IN_DAY);
}
