import { Transfer } from "../types/ERC20/ERC20";
import { EMISSION, LM } from "../../const";
import { Reward, Total } from "../types/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  if (event.params.from.toHexString() == EMISSION && event.params.to.toHexString() == LM) {
    const id = event.block.number.toString();
    let reward = Reward.load(id);
    if (reward == null) {
      reward = new Reward(id);
      reward.amount = event.params.value;

      reward.save();
    }

    let total = Total.load("0");
    if (total == null) {
      total = new Total("0");
      total.APR = BigInt.fromI32(0).toBigDecimal();
      total.reward = event.params.value;
    } else {
      total.reward = total.reward.plus(event.params.value);
    }
    total.save();
  }
}
