import { Reserve } from "../types/schema";
import { LP, PHTR, USDC } from "../../consts";
import { Sync, Transfer } from "../types/UniswapPair/UniswapPair";
import { BigInt } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO } from "./helpers";

export function handleSync(event: Sync): void {
  let id = LP;
  let reserve = Reserve.load(id);
  if (reserve == null) {
    reserve = new Reserve(id);
    reserve.token0 = USDC;
    reserve.token1 = PHTR;
    reserve.token0Decimals = BigInt.fromI32(6);
    reserve.token1Decimals = BigInt.fromI32(18);
    reserve.totalSupply = BigInt.fromI32(0);
  }
  reserve.reserve0 = event.params.reserve0;
  reserve.reserve1 = event.params.reserve1;
  reserve.save();
}

export function handleTransfer(event: Transfer): void {
  let id = LP;
  let reserve = Reserve.load(id);
  if (reserve == null) {
    reserve = new Reserve(id);
    reserve.token0 = USDC;
    reserve.token1 = PHTR;
    reserve.token0Decimals = BigInt.fromI32(6);
    reserve.token1Decimals = BigInt.fromI32(18);
    reserve.reserve0 = BigInt.fromI32(0);
    reserve.reserve1 = BigInt.fromI32(0);
    reserve.totalSupply = BigInt.fromI32(0);
  }

  if (event.params.from.toHexString() == ADDRESS_ZERO) {
    reserve.totalSupply = reserve.totalSupply.plus(event.params.value);
  }

  if (event.params.to.toHexString() == ADDRESS_ZERO) {
    reserve.totalSupply = reserve.totalSupply.minus(event.params.value);
  }
  reserve.save();
}
