import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { bigDecimal, ONE_BD } from '@phuture/subgraph-helpers';

import { LP, PHTR } from '../../consts';
import {
  Stake,
  Unstake,
  UnstakeRange,
} from '../types/LiquidityMining/LiquidityMining';
import { APR, Reserve, Reward, Total, VestingRange } from '../types/schema';

function toPHTR(amount: BigDecimal): BigDecimal {
  let reserve = Reserve.load(LP);

  if (
    reserve != null &&
    reserve.reserve0.gt(BigInt.zero()) &&
    reserve.reserve1.gt(BigInt.zero())
  ) {
    let phtrReserve: BigDecimal;
    let otherReserve: BigDecimal;
    let phtrDecimals: BigInt;
    let otherDecimals: BigInt;

    if (reserve.token0 == PHTR) {
      phtrReserve = reserve.reserve0.toBigDecimal();
      otherReserve = reserve.reserve1.toBigDecimal();
      phtrDecimals = reserve.token0Decimals;
      otherDecimals = reserve.token1Decimals;
    } else {
      phtrDecimals = reserve.token1Decimals;
      otherDecimals = reserve.token0Decimals;
      phtrReserve = reserve.reserve1.toBigDecimal();
      otherReserve = reserve.reserve0.toBigDecimal();
    }

    let Q112 = BigInt.fromI32(2).pow(112).toBigDecimal();
    let price = phtrReserve
      .div(phtrDecimals.toBigDecimal())
      .times(Q112)
      .div(otherReserve.div(otherDecimals.toBigDecimal()));

    let uPHTR = amount
      .times(phtrReserve)
      .div(reserve.totalSupply.toBigDecimal());
    let uOther = amount
      .times(otherReserve)
      .div(reserve.totalSupply.toBigDecimal());

    return uPHTR.plus(uOther.times(price).div(Q112));
  }

  return BigInt.fromI32(0).toBigDecimal();
}

function updateAPR(amount: BigInt, block: BigInt): void {
  let apr = APR.load('0');
  if (apr == null) {
    apr = new APR('0');
    apr.Wn = BigDecimal.zero();
    apr.n = ONE_BD;
  } else {
    let total = Total.load('0');
    if (total == null) {
      total = new Total('0');
      total.APR = BigDecimal.zero();
      total.reward = BigInt.zero();
    }

    let reward = Reward.load(block.toString());
    let stakedInPHTR = toPHTR(amount.toBigDecimal());
    if (
      reward != null &&
      stakedInPHTR.gt(BigDecimal.zero()) &&
      reward.amount.gt(BigInt.zero())
    ) {
      let an = reward.amount.toBigDecimal().div(stakedInPHTR);
      let newW = apr.Wn.plus(an);

      total.APR = newW.div(apr.n).times(bigDecimal.fromFloat(100));
      apr.Wn = newW;
      apr.n = apr.n.plus(ONE_BD);
    }

    total.save();
  }

  apr.save();
}

export function handleStake(event: Stake): void {
  let id = event.params.account
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat('-')
    .concat(BigInt.fromI32(event.params.rangeEndIndex).toString());

  let vesting = VestingRange.load(id);

  if (vesting == null) {
    vesting = new VestingRange(id);
    vesting.account = event.params.account.toHexString();
    vesting.amount = event.params.amount;
    vesting.rangeStartIndex = BigInt.fromI32(event.params.rangeStartIndex);
    vesting.rangeEndIndex = BigInt.fromI32(event.params.rangeEndIndex);
  } else {
    vesting.amount = vesting.amount.plus(event.params.amount);
  }

  vesting.unstaked = false;

  vesting.save();

  updateAPR(event.params.amount, event.block.number);
}

export function handleUnstake(event: Unstake): void {
  updateAPR(event.params.amount, event.block.number);
}

export function handleUnstakeRange(event: UnstakeRange): void {
  let id = event.params.account
    .toHexString()
    .concat('-')
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat('-')
    .concat(BigInt.fromI32(event.params.rangeEndIndex).toString());

  let vesting = VestingRange.load(id);
  if (!vesting) return;

  vesting.amount = vesting.amount.minus(event.params.unstakedAmount);
  if (vesting.amount.equals(BigInt.zero())) {
    vesting.unstaked = true;
  }

  vesting.save();
}
