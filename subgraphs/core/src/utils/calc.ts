import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

import { ONE_BD, ONE_BI, TEN_BD, TEN_BI, TWO_BD } from '../../../helpers';

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = new BigDecimal(ONE_BI);
  for (let i = BigInt.zero(); i.lt(decimals); i = i.plus(ONE_BI)) {
    bd = bd.times(TEN_BD);
  }

  return bd;
}

export function convertDecimals(
  tokenAmount: BigDecimal,
  exchangeDecimals: BigInt,
): BigDecimal {
  return exchangeDecimals == BigInt.zero()
    ? tokenAmount
    : tokenAmount.div(exponentToBigDecimal(exchangeDecimals));
}

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt,
): BigDecimal {
  return convertDecimals(tokenAmount.toBigDecimal(), exchangeDecimals);
}

export function feeInBP(amount: BigInt): BigDecimal {
  let scaledPerSecondRate = BigDecimal.fromString(amount.toString());
  let C = BigDecimal.fromString('1000000000000000000000000000');
  let N = BigInt.fromI32(365 * 24 * 60 * 60).toBigDecimal();

  // e = 1 - C / s
  let e = ONE_BD.minus(C.div(scaledPerSecondRate));

  // p1 = e*(N+1)/2
  let p1 = e.times(N.plus(ONE_BD)).div(TWO_BD);

  // p2 = e*e*(N+1)*(N+2)/6
  let p2 = e
    .times(e)
    .times(N.plus(ONE_BD))
    .times(N.plus(TWO_BD))
    .div(BigDecimal.fromString('6'));

  // x4 = N * e * (1 - p1 + p2)
  let x4 = N.times(e).times(ONE_BD.minus(p1).plus(p2));

  return x4.times(BigDecimal.fromString('100'));
}

export function convertTokenToBigInt(
  tokenAmount: BigInt,
  decimals: BigInt,
): BigInt {
  let int = tokenAmount;
  if (decimals.gt(BigInt.zero())) {
    for (let i = 0; i < decimals.toI32(); i++) {
      int = int.times(TEN_BI);
    }
  } else {
    for (let i = decimals.toI32(); i < 0; i++) {
      int = int.div(TEN_BI);
    }
  }

  return int;
}

export function exponentToBigInt(decimals: BigInt): BigInt {
  let int = ONE_BI;
  for (let i = BigInt.zero(); i.lt(decimals); i = i.plus(ONE_BI)) {
    int = int.times(TEN_BI);
  }

  return int;
}

export let Q112 = new BigDecimal(
  BigInt.fromString('5192296858534827628530496329220096'),
);
