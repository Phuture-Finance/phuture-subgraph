import { Address, ethereum } from '@graphprotocol/graph-ts';
import { BigInt, BigDecimal } from '@graphprotocol/graph-ts/index';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { newMockEvent } from 'matchstick-as/assembly/index';

import { handleAllIndexesTransfers } from '../mappings/phuture/transfer';
import { Index, Transaction, UserIndex } from '../types/schema';

test('transfer', () => {
  const newEvent = changetype<ethereum.Event>(newMockEvent());
  newEvent.logIndex = BigInt.fromI32(1);

  // This address is the default address for newMockEvent
  const index = new Index('0xa16081f360e3847006db660bae1c6d1b2e17ec2a');
  index.totalSupply = BigInt.fromI32(100000);

  // Store the index in the store, so that it can be accessed in the handler
  index.save();

  const from = '0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee';
  const to = '0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef';

  const fromUserIndexId = from
    .concat('-')
    .concat(newEvent.address.toHexString());
  const fromUserIndex = new UserIndex(fromUserIndexId);

  fromUserIndex.index = index.id;
  fromUserIndex.user = from;
  fromUserIndex.balance = BigDecimal.fromString('100000');
  fromUserIndex.save();

  const transaction = new Transaction(
    '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
  );
  transaction.timestamp = BigInt.fromString('1649328805');
  transaction.save();
  handleAllIndexesTransfers(
    newEvent,
    Address.fromString(from),
    Address.fromString(to),
    BigInt.fromI32(11111),
  );

  newEvent.logIndex = BigInt.fromI32(2);
  // New transaction with the same timestamp
  transaction.timestamp = BigInt.fromString('1649328805');
  transaction.save();
  handleAllIndexesTransfers(
    newEvent,
    Address.fromString(from),
    Address.fromString(to),
    BigInt.fromI32(77777),
  );

  assert.fieldEquals(
    'UserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1',
    'balance',
    '11111',
  );
  assert.fieldEquals(
    'UserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-2',
    'balance',
    '88888',
  );

  assert.fieldEquals(
    'UserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-1',
    'balance',
    '88889',
  );
  assert.fieldEquals(
    'UserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649328805-2',
    'balance',
    '11112',
  );

  assert.fieldEquals(
    'DailyUserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600',
    'avgBalance',
    '49999.5',
  );
  assert.fieldEquals(
    'DailyUserIndexHistory',
    '0x89205a3a3b2a69de6dbf7f01ed13b2108bc0ffee-0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1649289600',
    'avgBalance',
    '50000.5',
  );

  clearStore();
});
