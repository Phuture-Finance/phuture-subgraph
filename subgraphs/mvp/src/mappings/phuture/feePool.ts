import { Address, BigInt } from "@graphprotocol/graph-ts";
import { FeeInBPAUM, FeeInBPBurn, FeeInBPMint } from "@phuture/subgraph-helpers";
import { loadOrCreateIndex } from "../entities";
import { SetAUMFeeInBP, SetBurningFeeInBP, SetMintingFeeInBP } from "../../types/FeePool/FeePool";

function saveFeeInBP(indexAddress: Address, amount: i32, type: string): void {
  let index = loadOrCreateIndex(indexAddress);
  let value = BigInt.fromI32(amount);

  if (type === FeeInBPBurn) {
    index.feeBurn = value;
  } else if (type === FeeInBPAUM) {
    index.feeAUM = value;
  } else if (type === FeeInBPMint) {
    index.feeMint = value;
  } else {
    return;
  }

  index.save();
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBP): void {
  saveFeeInBP(event.params.index, event.params.mintingFeeInBP, FeeInBPMint);
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBP): void {
  saveFeeInBP(event.params.index, event.params.burningFeeInPB, FeeInBPBurn);
}

export function handleSetAUMFeeInBP(event: SetAUMFeeInBP): void {
  saveFeeInBP(event.params.index, event.params.AUMFeeInBP, FeeInBPAUM);
}
