import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

// To have more smooth charts until hourly not implemented.
export let SECONDS_IN_DAY = BigInt.fromI32(86_400); // 60 * 60 * 24

export let SECONDS_IN_YEAR = BigDecimal.fromString('31556952'); // 365.2425 * 24 * 60 * 60

export function getStartingDayTimestamp(timestamp: BigInt): BigInt {
  return timestamp.div(SECONDS_IN_DAY).times(SECONDS_IN_DAY);
}
