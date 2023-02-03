import {
  newMockEvent,
  assert,
  clearStore,
  test,
  logStore,
} from 'matchstick-as';
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Message } from '../src/types/schema';
import { handleBurningMessageFailed } from '../src/mappings/OmniIndex';
import { MessageFailed } from '../src/types/OmniIndex/OmniInterface';

test('transfer', () => {
  const user = '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7';
  const srcChainid = BigInt.fromI32(1);
  const srcAddress = Bytes.fromHexString(
    '0x89205a3a3b2a69de6dbf7f01ed13b2108b2cbeef',
  ) as Bytes;
  const nonce = BigInt.fromI32(1);
  const assetAmount = BigInt.fromI32(1_000);

  const messageFailedEvent = changetype<MessageFailed>(newMockEvent());
  messageFailedEvent.parameters = new Array();
  let srcChainIdParam = new ethereum.EventParam(
    '_srcChainId',
    ethereum.Value.fromUnsignedBigInt(srcChainid),
  );
  let srcAddressParam = new ethereum.EventParam(
    '_srcAddress',
    ethereum.Value.fromBytes(srcAddress),
  );
  let nonceParam = new ethereum.EventParam(
    '_nonce',
    ethereum.Value.fromUnsignedBigInt(nonce),
  );
  let userParam = new ethereum.EventParam(
    '_sender',
    ethereum.Value.fromAddress(Address.fromString(user)),
  );
  let assetAmountParam = new ethereum.EventParam(
    '_assetAmount',
    ethereum.Value.fromUnsignedBigInt(assetAmount),
  );
  // This has to be in the same order as the event parameters
  messageFailedEvent.parameters.push(srcChainIdParam);
  messageFailedEvent.parameters.push(srcAddressParam);
  messageFailedEvent.parameters.push(nonceParam);
  messageFailedEvent.parameters.push(userParam);
  messageFailedEvent.parameters.push(assetAmountParam);

  let messageId = user
    .concat('-')
    .concat(nonce.toHexString())
    .concat('-')
    .concat(srcChainid.toString())
    .concat('-')
    .concat(srcAddress.toHexString());

  const message = new Message(messageId);
  message.assetAmount = assetAmount;
  message.user = user;
  message.srcChainId = srcChainid;
  message.srcAddress = srcAddress;
  message.nonce = nonce;

  message.save();

  handleBurningMessageFailed(messageFailedEvent);

  logStore();

  assert.fieldEquals(
    'Message',
    messageId,
    'assetAmount',
    assetAmount.toString(),
  );

  clearStore();
});
