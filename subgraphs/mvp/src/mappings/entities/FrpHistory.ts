import {BigInt} from '@graphprotocol/graph-ts';
import {UserFrpHistory, DailyUserFrpHistory} from '../../types/schema';
import {getStartingDayTimestamp} from '../../utils/timestamp';

export function newUserFrpHistory(userId: string, vaultId: string, timestamp: BigInt, txLogIndex: BigInt): UserFrpHistory {
  let id = userId.concat("-").concat(vaultId).concat("-").concat(timestamp.toString()).concat("-").concat(txLogIndex.toString());

  let history = new UserFrpHistory(id);
  history.user = userId;
  history.vault = vaultId;
  history.save();

  return history;
}

export function loadOrCreateDailyUserFrpHistory(userId: string, vaultId: string, timestamp: BigInt): DailyUserFrpHistory  {
  let id = userId.concat("-").concat(vaultId).concat("-").concat(getStartingDayTimestamp(timestamp).toString());

  let dailyFVH = DailyUserFrpHistory.load(id);

  if (!dailyFVH) {
    dailyFVH = new DailyUserFrpHistory(id);
    dailyFVH.timestamp = getStartingDayTimestamp(timestamp);
    dailyFVH.user = userId;
    dailyFVH.vault = vaultId;
    dailyFVH.save();
  }

  return dailyFVH;
}
