import { BigInt } from '@graphprotocol/graph-ts';
import { UserIndexHistory, DailyUserIndexHistory, Transaction } from '../../types/schema';
import { getStartingDayTimestamp  } from '../../utils/timestamp';

export function newUserIndexHistory(tx: Transaction, userID: string, indexID: string): UserIndexHistory {
  let id = "";

  let retry = true
  let incrementID: i32 = -1;

  while (retry) {
    incrementID++;
    id = userID.concat("-").concat(indexID).concat("-").concat(tx.timestamp.toString()).concat("-").concat(incrementID.toString());

    let uih = UserIndexHistory.load(id);

    if (!uih) {
      retry = false;
    }
  }

  let userIndexHistory = new UserIndexHistory(id);

  userIndexHistory.user = userID;
  userIndexHistory.index = indexID;

  userIndexHistory.save();

  return userIndexHistory;
}

export function loadOrCreateDaylyUserIndexHistory(userID: string, indexID: string, timestamp: i64): DailyUserIndexHistory  {
  let id = userID.concat("-").concat(indexID).concat("-").concat(getStartingDayTimestamp(timestamp).toString());

  let dailyUserIndexHistory = DailyUserIndexHistory.load(id);

  if (!dailyUserIndexHistory) {
    dailyUserIndexHistory = new DailyUserIndexHistory(id);

    dailyUserIndexHistory.timestamp = BigInt.fromI64(getStartingDayTimestamp(timestamp));

    dailyUserIndexHistory.user = userID;
    dailyUserIndexHistory.index = indexID;

    dailyUserIndexHistory.save();
  }

  return dailyUserIndexHistory;
}
