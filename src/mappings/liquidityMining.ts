import { Stake, Unstake, UnstakeRange } from "../types/LiquidityMining/LiquidityMining";
import { Asset, LM, Pair, Reward, VestingRange } from "../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { FACTORY_ADDRESS, LP_ADDRESS, PHTR_ADDRESS } from "../consts";
import { ONE_BD, Q112, ZERO_BD, ZERO_BI } from "./helpers";

function updateAPR(amount: BigInt, block: BigInt): void {
  let lm = LM.load(FACTORY_ADDRESS);
  if (lm == null) {
    lm = new LM(FACTORY_ADDRESS);
    lm.Wn = ZERO_BD;
    lm.n = ONE_BD;
    lm.APR = ZERO_BD;
    lm.totalReward = ZERO_BI;
  }

  let reward = Reward.load(block.toString());
  let stakedInPHTR = toPHTR(amount.toBigDecimal());

  if (reward != null && stakedInPHTR.gt(ZERO_BD) && reward.amount.gt(ZERO_BI)) {
    let an = reward.amount.toBigDecimal().div(stakedInPHTR);
    let newW = lm.Wn.plus(an);
    lm.APR = newW.div(lm.n).times(BigInt.fromI32(100).toBigDecimal());
    lm.Wn = newW;
    lm.n = lm.n.plus(ONE_BD);
  }

  lm.save();
}

export function handleStake(event: Stake): void {
  let id = event.params.account
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
  updateAPR(event.params.amount, event.block.number);
}

export function handleUnstakeRange(event: UnstakeRange): void {
  let id = event.params.account
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeEndIndex).toString());

  let vesting = VestingRange.load(id);

  vesting.amount = vesting.amount.minus(event.params.unstakedAmount);
  if (vesting.amount.equals(BigInt.fromI32(0))) {
    vesting.unstaked = true;
  }

  vesting.save();
}

function toPHTR(amount: BigDecimal): BigDecimal {
  let reserve = Pair.load(LP_ADDRESS);
  if (reserve != null && reserve.asset0Reserve.gt(ZERO_BD) && reserve.asset1Reserve.gt(ZERO_BD)) {
    let phtrReserve: BigDecimal;
    let otherReserve: BigDecimal;
    let phtrDecimals: BigInt;
    let otherDecimals: BigInt;

    if (reserve.asset0 == PHTR_ADDRESS) {
      phtrReserve = reserve.asset0Reserve;
      otherReserve = reserve.asset1Reserve;
      phtrDecimals = Asset.load(reserve.asset0).decimals;
      otherDecimals = Asset.load(reserve.asset1).decimals;
    } else {
      phtrReserve = reserve.asset1Reserve;
      otherReserve = reserve.asset0Reserve;
      phtrDecimals = Asset.load(reserve.asset1).decimals;
      otherDecimals = Asset.load(reserve.asset0).decimals;
    }

    let price = phtrReserve.div(BigInt.fromI32(phtrDecimals as i32).toBigDecimal())
      .times(Q112).div(otherReserve.div(BigInt.fromI32(otherDecimals as i32).toBigDecimal()));
    let uPHTR = amount.times(phtrReserve).div(reserve.totalSupply.toBigDecimal());
    let uOther = amount.times(otherReserve).div(reserve.totalSupply.toBigDecimal());

    return uPHTR.plus(uOther.times(price).div(Q112));
  }

  return ZERO_BD;
}
