import { MessageFailed } from '../types/OmniIndex/OmniInterface';
import { BigInt } from '@graphprotocol/graph-ts';
import { Message } from '../types/schema';

export function handleMessageFailed(event: MessageFailed): void {
  let id = event.params._sender
    .toHexString()
    .concat('-')
    .concat(event.params._nonce.toHexString())
    .concat('-')
    .concat(event.params._srcChainId.toString())
    .concat('-')
    .concat(event.params._srcAddress.toHexString());

  let message = Message.load(id);
  if (!message) {
    message = new Message(id);
    message.status = 'Failed';
    message.user = event.params._sender.toHexString();
    message.srcChainId = BigInt.fromI32(event.params._srcChainId);
    message.srcAddress = event.params._srcAddress;
    message.nonce = event.params._nonce;
    message.assetAmount = event.params._assetAmount;
  }
  message.save();
}
