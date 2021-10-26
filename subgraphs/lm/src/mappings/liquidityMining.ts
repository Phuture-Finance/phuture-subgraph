import { Stake, Unstake, UnstakeRange } from "../types/LiquidityMining/LiquidityMining";
import { APR, Reward, Total, VestingRange, Reserve } from "../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { LP, PHTR } from "../../const";

function toPHTR(amount: BigDecimal): BigDecimal {
  const reserve = Reserve.load(LP);
  if (reserve != null && reserve.reserve0.gt(BigInt.fromI32(0)) && reserve.reserve1.gt(BigInt.fromI32(0))) {
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
    const Q112 = BigInt.fromI32(2).pow(112).toBigDecimal();
    const price = phtrReserve.div(BigInt.fromI32(18).toBigDecimal()).times(Q112).div(otherReserve.div(BigInt.fromI32(6).toBigDecimal()));
    const uPHTR = amount.times(phtrReserve).div(reserve.totalSupply.toBigDecimal());
    const uOther = amount.times(otherReserve).div(reserve.totalSupply.toBigDecimal());
    return uPHTR.plus(uOther.times(price).div(Q112));
  } else {
    return BigInt.fromI32(0).toBigDecimal()
  }
}

function updateAPR(amount: BigInt, block: BigInt): void {
  let apr = APR.load('0');
  if (apr == null) {
    apr = new APR('0');
    apr.Wn = BigInt.fromI32(0).toBigDecimal();
    apr.n = BigInt.fromI32(1).toBigDecimal();
  } else {
    let total = Total.load('0');
    if (total == null) {
      total = new Total('0');
      total.APR = BigInt.fromI32(0).toBigDecimal();
      total.reward = BigInt.fromI32(0);
    }
    const reward = Reward.load(block.toString());
    const stakedInPHTR = toPHTR(amount.toBigDecimal());
    if (reward != null && stakedInPHTR.gt(BigInt.fromI32(0).toBigDecimal()) && reward.amount.gt(BigInt.fromI32(0))) {
      const an = reward.amount.toBigDecimal().div(stakedInPHTR)
      const newW = apr.Wn.plus(an);
      total.APR = newW.div(apr.n).times(BigInt.fromI32(100).toBigDecimal());
      apr.Wn = newW;
      apr.n = apr.n.plus(BigInt.fromI32(1).toBigDecimal());
    }
    total.save();
  }
  apr.save();
}

export function handleStake(event: Stake): void {
  const id = event.params.account
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat("-")
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
  updateAPR(event.params.amount, event.block.number)
}

export function handleUnstakeRange(event: UnstakeRange): void {
  const id = event.params.account
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeEndIndex).toString());

  const vesting = VestingRange.load(id);
  if (!vesting) return

  vesting.amount = vesting.amount.minus(event.params.unstakedAmount);
  if (vesting.amount.equals(BigInt.fromI32(0))) {
    vesting.unstaked = true;
  }
  vesting.save();
}
