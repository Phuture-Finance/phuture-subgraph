import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts/index";

export let ONE_BI = BigInt.fromI32(1);
export let ONE_BD = BigDecimal.fromString("1");

export let IndexStatic = "static";
export let IndexTracked = "tracked";
export let IndexTopN = "topN";

export let FeeInBPMint = 'Mint';
export let FeeInBPBurn = 'Burn';
export let FeeInBPAUM = 'AUM';

// keccak256("ASSET_ROLE)
export let ASSET_ROLE = Bytes.fromHexString("86d5cf0a6bdc8d859ba3bdc97043337c82a0e609035f378e419298b6a3e00ae6");
