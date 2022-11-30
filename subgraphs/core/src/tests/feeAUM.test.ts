import { ethereum, Address } from '@graphprotocol/graph-ts';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { newMockEvent } from 'matchstick-as/assembly/index';

import { handleSetAUMFeeInBP } from '../mappings/phuture/feePool';
import { SetAUMScaledPerSecondsRate } from '../types/FeePool/FeePool';
import { Index } from '../types/schema';

test('fee AUM test', () => {
  const scaledPerSecondRateEvent = changetype<SetAUMScaledPerSecondsRate>(
    newMockEvent(),
  );

  // parameters push from the newMockEvent must be pushed in this order:
  /*
  export class SetAUMScaledPerSecondsRate__Params {
    _event: SetAUMScaledPerSecondsRate;

    constructor(event: SetAUMScaledPerSecondsRate) {
      this._event = event;
    }

    get account(): Address {
      return this._event.parameters[0].value.toAddress();
    }

    get index(): Address {
      return this._event.parameters[1].value.toAddress();
    }

    get AUMScaledPerSecondsRate(): BigInt {
      return this._event.parameters[2].value.toBigInt();
    }
  }
*/

  // accountParam is not used after but pushed in the 0 position
  const accountParam = new ethereum.EventParam(
    'account',
    ethereum.Value.fromAddress(
      Address.fromString('0x123456789abcdef123456789abcdef123456789a'),
    ),
  );
  scaledPerSecondRateEvent.parameters.push(accountParam);
  const indexParam = new ethereum.EventParam(
    'index',
    ethereum.Value.fromAddress(
      Address.fromString('0xa16081f360e3847006db660bae1c6d1b2e17ec2a'),
    ),
  );
  scaledPerSecondRateEvent.parameters.push(indexParam);
  const AUMscaledPerSecondRate = new ethereum.EventParam(
    'AUMscaledPerSecondRate',
    ethereum.Value.fromSignedBigInt(
      BigInt.fromString('1000000000031725657458124183'),
    ),
  );
  scaledPerSecondRateEvent.parameters.push(AUMscaledPerSecondRate);

  const index = new Index('0xa16081f360e3847006db660bae1c6d1b2e17ec2a');

  // Store the index in the store, so that it can be accessed in the handler
  index.save();

  // New transaction with the same timestamp
  handleSetAUMFeeInBP(scaledPerSecondRateEvent);

  assert.fieldEquals(
    'Index',
    '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    'feeAUMPercent',
    '0.1000000000010031953533967622319537',
  );
  clearStore();
});

/*
  let scaledPerSecondRate = BigDecimal.fromString("1000000000031725657458124183");
--------------------------------------------------
  √ fee AUM test - 0.379ms
    💬 C/s: 0.9999999999682743425428823343411183
    💬 e: 0.0000000000317256574571176656588817
    💬 N*e: 0.0010005003335676627042184932912
    💬 p1: 0.00050025018264666008066807947504085
    💬 p2: 0.0000001668335021155998261767299758387267
    💬 x4: 0.001000000000010031953533967622319537
    💬 feeAUMPercent: 0.1000000000010031953533967622319537
*/
