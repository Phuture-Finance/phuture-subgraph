import { Address, BigInt } from '@graphprotocol/graph-ts';
import { FeeInBPAUM, FeeInBPBurn, FeeInBPMint } from '../../../../helpers';
import { loadOrCreateIndex } from '../entities';
import { SetAUMScaledPerSecondsRate, SetBurningFeeInBP, SetMintingFeeInBP } from '../../types/FeePool/FeePool';

function saveFeeInBP(indexAddress: Address, amount: BigInt, type: string): void {
  let index = loadOrCreateIndex(indexAddress);

  if (type == FeeInBPBurn) {
    index.feeBurn = amount;
  } else if (type == FeeInBPAUM) {
    index.feeAUM = amount;

    let bp = BigInt.fromI32(10000);
    let k = (index.feeAUM.div(bp)).div(BigInt.fromI32(1).minus(index.feeAUM.div(bp)));

    // k = (x/10000) / (1 - x/10000)
    // ((k / (1e27)) ** t) - 1
    // index.feeAUMPercent = k.div(BigInt.fromI32(1e27 as i32)).pow(362).minus(BigInt.fromI32(1));
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
