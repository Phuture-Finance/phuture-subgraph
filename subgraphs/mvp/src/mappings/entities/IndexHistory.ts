import { BigInt } from '@graphprotocol/graph-ts';

import {
  UserIndexHistory,
  DailyCapitalization,
} from '../../types/schema';
import { getStartingDayTimestamp } from '../../utils/timestamp';

export function newUserIndexHistory(
  userID: string,
  indexID: string,
  timestamp: BigInt,
  txLogIndex: BigInt,
): UserIndexHistory {
  let id = userID
    .concat('-')
    .concat(indexID)
    .concat('-')
    .concat(timestamp.toString())
    .concat('-')
    .concat(txLogIndex.toString());

  let userIndexHistory = new UserIndexHistory(id);
  userIndexHistory.user = userID;
  userIndexHistory.index = indexID;
  userIndexHistory.save();

  return userIndexHistory;
}

export function newDailyCapitalization(
  indexID: string,
  timestamp: BigInt,
): DailyCapitalization {
  let id = indexID
    .concat('-')
    .concat(getStartingDayTimestamp(timestamp).toString());

  let dailyCap = DailyCapitalization.load(id);
  if (!dailyCap) {
    dailyCap = new DailyCapitalization(id);
    dailyCap.index = indexID;
    dailyCap.timestamp = timestamp;

    dailyCap.save();
  }

  return dailyCap;
}
