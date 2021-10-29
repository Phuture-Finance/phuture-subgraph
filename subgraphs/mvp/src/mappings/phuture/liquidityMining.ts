import { Stake, Unstake, UnstakeRange } from "../../types/LiquidityMining/LiquidityMining";
import { Asset, LM, Pair, Reward, VestingRange } from "../../types/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { BASE_ADDRESS, FACTORY_ADDRESS, LP_ADDRESS, PHTR_ADDRESS } from "../../../consts";
import { getAssetDecimals, Q112, ZERO_BD, ZERO_BI } from "../helpers";

function getUValue(balance: BigDecimal, pair: Pair, token: string): BigDecimal {
  let isPHTR = token === PHTR_ADDRESS;

  let phtr = Asset.load(isPHTR ? pair.asset1 : pair.asset0);
  if (phtr == null) {
    return ZERO_BD;
  }

  return balance
    .times(isPHTR ? pair.asset1Reserve : pair.asset0Reserve)
    .div(
      BigInt.fromI32(10)
        .pow(phtr.decimals.toI32() as u8)
        .toBigDecimal()
    )
    .div(pair.totalSupply.toBigDecimal());
}

function updateAPR(amount: BigInt, block: BigInt): void {
  let lm = LM.load(FACTORY_ADDRESS);
  if (lm == null) {
    lm = new LM(FACTORY_ADDRESS);

    lm.APR = ZERO_BD;
    lm.totalReward = ZERO_BI;
  }

  let pair = Pair.load(LP_ADDRESS);
  if (pair === null) return;

  let reward = Reward.load(block.toString());
  let stakedInPHTR = toPHTR(amount.toBigDecimal());
  let asset1Decimals = getAssetDecimals(pair.asset1);

  if (reward != null && stakedInPHTR.gt(ZERO_BD) && reward.amount.gt(ZERO_BI)) {
    let price = pair.asset1Reserve
      .div(
        BigInt.fromI32(10)
          .pow(asset1Decimals.toI32() as u8)
          .toBigDecimal()
      )
      .times(Q112)
      .div(
        pair.asset0Reserve.div(
          BigInt.fromI32(10)
            .pow(asset1Decimals.toI32() as u8)
            .toBigDecimal()
        )
      );

    let uPHTR = getUValue(pair.totalSupply.toBigDecimal(), pair as Pair, PHTR_ADDRESS);
    let uOther = getUValue(pair.totalSupply.toBigDecimal(), pair as Pair, BASE_ADDRESS);

    let stakedInPhtr = uOther && uPHTR && price && uPHTR.plus(uOther.times(price).div(Q112));

    lm.APR = BigInt.fromI32(2000000).toBigDecimal().div(stakedInPhtr).times(BigInt.fromI32(100).toBigDecimal());
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

  if (!vesting) {
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
  // TODO: how we handle null exception?
  if (!vesting) return;

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

    let asset1Decimals: BigInt = getAssetDecimals(reserve.asset0);
    let asset2Decimals: BigInt = getAssetDecimals(reserve.asset1);

    if (reserve.asset0 == PHTR_ADDRESS) {
      phtrReserve = reserve.asset0Reserve;
      otherReserve = reserve.asset1Reserve;
      phtrDecimals = asset1Decimals;
      otherDecimals = asset2Decimals;
    } else {
      phtrReserve = reserve.asset1Reserve;
      otherReserve = reserve.asset0Reserve;
      phtrDecimals = asset2Decimals;
      otherDecimals = asset1Decimals;
    }

    let price = phtrReserve
      .div(BigInt.fromI32(phtrDecimals.toI32()).toBigDecimal())
      .times(Q112)
      .div(otherReserve.div(BigInt.fromI32(otherDecimals.toI32()).toBigDecimal()));
    let uPHTR = amount.times(phtrReserve).div(reserve.totalSupply.toBigDecimal());
    let uOther = amount.times(otherReserve).div(reserve.totalSupply.toBigDecimal());

    return uPHTR.plus(uOther.times(price).div(Q112));
  }

  return ZERO_BD;
}
