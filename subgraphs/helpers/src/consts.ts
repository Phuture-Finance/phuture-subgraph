import { BigDecimal, BigInt } from "@graphprotocol/graph-ts/index";

export let ONE_BI = BigInt.fromI32(1);
export let ONE_BD = BigDecimal.fromString("1");

export let IndexStatic = "static";
export let IndexTracked = "tracked";
export let IndexTopN = "topN";
