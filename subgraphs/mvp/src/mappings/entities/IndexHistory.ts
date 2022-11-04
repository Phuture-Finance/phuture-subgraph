import { BigInt } from '@graphprotocol/graph-ts';

import {
  UserIndexHistory,
  DailyUserIndexHistory,
  DailyCapitalization,
  UserCapitalization,
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

export function loadOrCreateDaylyUserIndexHistory(
  userID: string,
  indexID: string,
  timestamp: BigInt,
): DailyUserIndexHistory {
  let id = userID
    .concat('-')
    .concat(indexID)
    .concat('-')
    .concat(getStartingDayTimestamp(timestamp).toString());

  let dailyUserIndexHistory = DailyUserIndexHistory.load(id);
  if (!dailyUserIndexHistory) {
    dailyUserIndexHistory = new DailyUserIndexHistory(id);
    dailyUserIndexHistory.timestamp = getStartingDayTimestamp(timestamp);
    dailyUserIndexHistory.user = userID;
    dailyUserIndexHistory.index = indexID;

    dailyUserIndexHistory.save();
  }

  return dailyUserIndexHistory;
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

export function newUserCapitalization(
  indexID: string,
  timestamp: BigInt,
  logIndex: BigInt,
): UserCapitalization {
  let id = indexID
    .concat('-')
    .concat(timestamp.toString())
    .concat('-')
    .concat(logIndex.toString());

  let userCap = UserCapitalization.load(id);
  if (!userCap) {
    userCap = new UserCapitalization(id);
    userCap.index = indexID;
    userCap.timestamp = timestamp;

    userCap.save();
  }

  return userCap;
}
