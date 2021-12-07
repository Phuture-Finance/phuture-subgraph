import { Address, BigInt } from '@graphprotocol/graph-ts';
import { FeeInBPAUM, FeeInBPBurn, FeeInBPMint } from '@phuture/subgraph-helpers';
import { loadOrCreateIndex } from '../entities';
import { SetAUMScaledPerSecondsRate, SetBurningFeeInBP, SetMintingFeeInBP } from '../../types/FeePool/FeePool';

function saveFeeInBP(indexAddress: Address, amount: BigInt, type: string): void {
  let index = loadOrCreateIndex(indexAddress);

  if (type == FeeInBPBurn) {
    index.feeBurn = amount;
  } else if (type == FeeInBPAUM) {
    index.feeAUM = amount;
  } else if (type == FeeInBPMint) {
    index.feeMint = amount;
  } else {
    return;
  }

  index.save();
}

export function handleSetMintingFeeInBP(event: SetMintingFeeInBP): void {
  saveFeeInBP(event.params.index, BigInt.fromI32(event.params.mintingFeeInBP), FeeInBPMint);
}

export function handleSetBurningFeeInBP(event: SetBurningFeeInBP): void {
  saveFeeInBP(event.params.index, BigInt.fromI32(event.params.burningFeeInPB), FeeInBPBurn);
}

export function handleSetAUMFeeInBP(event: SetAUMScaledPerSecondsRate): void {
  saveFeeInBP(event.params.index, event.params.AUMScaledPerSecondsRate, FeeInBPAUM);
}
