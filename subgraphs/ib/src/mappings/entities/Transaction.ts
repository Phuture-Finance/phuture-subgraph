import { ethereum } from '@graphprotocol/graph-ts';

import { Transaction } from '../../types/schema';

export function loadOrCreateTransaction(event: ethereum.Event): Transaction {
  let id = event.transaction.hash.toHexString();

  let tx = Transaction.load(id);
  if (!tx) {
    tx = new Transaction(id);
    tx.blockNumber = event.block.number;
    tx.timestamp = event.block.timestamp;
    tx.value = event.transaction.value;
    tx.gasPrice = event.transaction.gasPrice;
    tx.gasUsed = event.block.gasUsed;

    tx.save();
  }

  return tx as Transaction;
}
