// TODO fix the imports
import {Address, BigInt} from "@graphprotocol/graph-ts";

import {loadOrCreateIndexBetting} from "../entities/IndexBetting";
import {Transfer} from "../types/IndexBetting/IndexBetting";
import {IndexBettingTransfer, IndexBettingUser} from "../types/schema";
import {loadOrCreateIndexBettingUser} from "../entities/Account";
import {loadOrCreateTransaction} from "../entities/Transaction";

export function handleTransfer(event: Transfer): void {
    let indexBetting = loadOrCreateIndexBetting(event.address, event.block.timestamp);

    loadOrCreateIndexBettingUser(event.params.from);
    loadOrCreateIndexBettingUser(event.params.to);

    let transferType: string;
    if (event.params.from.equals(Address.zero())) {
        indexBetting.totalDeposited = indexBetting.totalDeposited.plus(event.params.amount);
        transferType = 'Mint';
    } else if (event.params.to.equals(Address.zero())) {
        indexBetting.totalDeposited = indexBetting.totalDeposited.minus(event.params.amount);
        transferType = 'Burn';
    } else {
        transferType = 'Send';
    }

    // It's a transfer or a burn
    if (!event.params.from.equals(Address.zero())) {
        let fromUserId = event.params.from.toHexString();
        let fromUser = IndexBettingUser.load(fromUserId);
        if (!fromUser) {
            fromUser = new IndexBettingUser(fromUserId);
            fromUser.indexBetting = event.address.toHexString();
            fromUser.balance = BigInt.zero();
        }

        fromUser.balance = fromUser.balance.minus(event.params.amount);

        if (fromUser.balance.equals(BigInt.zero())) {
            indexBetting.uniqueHolders = indexBetting.uniqueHolders.minus(BigInt.fromI32(1));
        }
        // TODO add user histories etc.
        fromUser.save();
    }

    // It's a transfer or a mint
    if(!event.params.to.equals(Address.zero())) {
        let toUserId = event.params.to.toHexString();
        let toUser = IndexBettingUser.load(toUserId);
        if (!toUser) {
            toUser = new IndexBettingUser(toUserId);
            toUser.indexBetting = event.address.toHexString();
            toUser.balance = BigInt.zero();
        }

        if (toUser.balance.equals(BigInt.zero())) {
            indexBetting.uniqueHolders = indexBetting.uniqueHolders.plus(BigInt.fromI32(1));
        }
        toUser.balance = toUser.balance.plus(event.params.amount);
        // TODO add user histories etc.
        toUser.save();
    }

    loadOrCreateTransaction(event);

    let transferFrom = IndexBettingTransfer.load(event.params.from.toHexString());
    if (!transferFrom) {
        transferFrom = new IndexBettingTransfer(event.params.from.toHexString());
        transferFrom.indexBetting = event.address.toHexString();
        transferFrom.from = event.params.from.toHexString();
        transferFrom.to = event.params.to.toHexString();
        transferFrom.amount = event.params.amount;
        transferFrom.type = transferType;
        transferFrom.timestamp = event.block.timestamp;
        transferFrom.save();
    }

    let transferTo = IndexBettingTransfer.load(event.params.to.toHexString());
    if(!transferTo) {
        transferTo = new IndexBettingTransfer(event.params.to.toHexString());
        transferTo.indexBetting = event.address.toHexString();
        transferTo.from = event.params.from.toHexString();
        transferTo.to = event.params.to.toHexString();
        transferTo.amount = event.params.amount;
        transferTo.type = transferType;
        transferTo.timestamp = event.block.timestamp;
        transferTo.save();
    }
}
