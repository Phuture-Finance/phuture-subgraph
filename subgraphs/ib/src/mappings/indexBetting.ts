import { Address, BigInt } from '@graphprotocol/graph-ts';

import { loadOrCreateIndexBetting } from './entities/IndexBetting';
import {BettingChallengeStarted, Initialized, Transfer} from '../types/IndexBetting/IndexBetting';
import { User } from '../types/schema';
import { loadOrCreateUser } from './entities/Account';

import { createTransfer } from './entities/Transfer';

export function handleTransfer(event: Transfer): void {
  let indexBetting = loadOrCreateIndexBetting(event.address, event.block.timestamp);

  loadOrCreateUser(event.params.from);
  loadOrCreateUser(event.params.to);

  let transferType: string;
  if (event.params.from.equals(Address.zero())) {
    transferType = 'Mint';
  } else if (event.params.to.equals(Address.zero())) {
    transferType = 'Burn';
  } else {
    transferType = 'Send';
  }

  // It's a transfer or a burn
  if (!event.params.from.equals(Address.zero())) {
    let fromUserId = event.params.from.toHexString();
    let fromUser = User.load(fromUserId);
    if (!fromUser) {
      fromUser = new User(fromUserId);
      fromUser.indexBetting = event.address.toHexString();
      fromUser.balance = BigInt.zero();
    }

    fromUser.balance = fromUser.balance.minus(event.params.value);

    if (fromUser.balance.equals(BigInt.zero())) {
      indexBetting.betParticipants = indexBetting.betParticipants.minus(BigInt.fromI32(1));
    }
    fromUser.save();
  }

  // It's a transfer or a mint
  if (!event.params.to.equals(Address.zero())) {
    let toUserId = event.params.to.toHexString();
    let toUser = User.load(toUserId);
    if (!toUser) {
      toUser = new User(toUserId);
      toUser.indexBetting = event.address.toHexString();
      toUser.balance = BigInt.zero();
    }

    if (toUser.balance.equals(BigInt.zero())) {
      indexBetting.betParticipants = indexBetting.betParticipants.plus(BigInt.fromI32(1));
    }
    toUser.balance = toUser.balance.plus(event.params.value);
    toUser.save();
  }

  createTransfer(event, transferType);
  indexBetting.save();
}

export function handleBettingChallengeStarted(event: BettingChallengeStarted): void {
  let indexBetting = loadOrCreateIndexBetting(event.address, event.block.timestamp);

  indexBetting.frontRunningLockupDuration = event.params.frontRunningLockupDuration;
  indexBetting.challengeStart = event.params.challengeStart;
  indexBetting.challengeEnd = event.params.challengeEnd;
  indexBetting.save();
}

export function handleInitialized(event: Initialized): void {
  loadOrCreateIndexBetting(event.address, event.block.timestamp);
}
