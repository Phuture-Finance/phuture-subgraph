import { BigInt } from '@graphprotocol/graph-ts';

export const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 4);
export const SECONDS_IN_HOUR = BigInt.fromI32(60 * 60);

export function getStartingTimestamp(
  timestamp: BigInt,
  secondsDuration: BigInt,
): BigInt {
  let dayID = timestamp.div(secondsDuration);

  return dayID.times(secondsDuration);
}
