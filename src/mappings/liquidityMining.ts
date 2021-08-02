import { Stake, UnstakeRange } from "../types/LiquidityMining/LiquidityMining";
import { VestingRange } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";


export function handleStake(event: Stake): void {
  let id = event.params.account
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeStartIndex).toString())
    .concat("-")
    .concat(BigInt.fromI32(event.params.rangeEndIndex).toString());

  let vesting = VestingRange.load(id);

  if (vesting === null) {
    vesting = new VestingRange(id);
    vesting.account = event.params.account.toHexString();
    vesting.amount = event.params.amount;
    vesting.rangeStartIndex = BigInt.fromI32(event.params.rangeStartIndex);
    vesting.rangeEndIndex = BigInt.fromI32(event.params.rangeEndIndex);
  } else {
    vesting.amount = vesting.amount.plus(event.params.amount);
  }
  vesting.unstaked = false;

  vesting.save()
}

export function handleUnstake(event: UnstakeRange): void {
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
  vesting.save()
}
