import { BigInt } from '@graphprotocol/graph-ts';
import { Message } from '../types/schema';
import {BurningMessage} from "../types/MessageRouter/MessageRouter";

export function handleBurningMessageFailed(event: BurningMessage): void {
  let id = event.params.sender
    .toHexString()
    .concat('-')
    .concat(event.params.nonce.toHexString())
    .concat('-')
    .concat(event.params.srcChainId.toString())
    .concat('-')
    .concat(event.params.srcAddress.toHexString());

  let message = Message.load(id);
  if (!message) {
    // Set the message values only once it is created
    message = new Message(id);
    message.user = event.params.sender.toHexString();
    message.srcChainId = BigInt.fromI32(event.params.srcChainId);
    message.srcAddress = event.params.srcAddress;
    message.nonce = event.params.nonce;
    message.assetAmount = event.params.assetAmount;
  }

  // There are two options here:
    // 1. Initial message is successful, we save it as a success and nothing is stored on sc
    // 2. Initial message is failed, and this is retry which succeeds, we change its status on sg and delete it on sc.
  message.status = event.params.success ? 'Success' : 'Failed';

  message.save();
}


