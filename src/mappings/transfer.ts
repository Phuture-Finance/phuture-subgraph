import { Transfer, UserIndex } from '../types/schema'
import { Transfer as TransferEvent } from '../types/templates/Transfer/MBTransfer'
import { ADDRESS_ZERO, createTransaction, createUser, ZERO_BI } from './helpers'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleTransfer(event: TransferEvent): void {
  let tx = createTransaction(event)

  let from = event.params.from
  createUser(from)
  let to = event.params.to
  createUser(to)

  let transfers = tx.transfers

  let fromUserIndexId = from.toHexString()
    .concat('-')
    .concat(event.address.toHexString())
  let fromUserIndex = UserIndex.load(fromUserIndexId)
  if (fromUserIndex === null) {
    fromUserIndex = new UserIndex(fromUserIndexId)
    fromUserIndex.index = event.address.toHexString()
    fromUserIndex.user = from.toHexString()
    fromUserIndex.total = ZERO_BI
  }

  let toUserIndexId = to.toHexString()
    .concat('-')
    .concat(event.address.toHexString())
  let toUserIndex = UserIndex.load(toUserIndexId)
  if (toUserIndex === null) {
    toUserIndex = new UserIndex(toUserIndexId)
    toUserIndex.index = event.address.toHexString()
    toUserIndex.user = to.toHexString()
    toUserIndex.total = ZERO_BI
  }

  let transferType: string
  if (from.toHexString() == ADDRESS_ZERO) {
    toUserIndex.total = toUserIndex.total.plus(event.params.value)

    transferType = 'Mint'
  } else if (to.toHexString() == ADDRESS_ZERO) {
    fromUserIndex.total = fromUserIndex.total.minus(event.params.value)

    transferType = 'Burn'
  } else {
    fromUserIndex.total = fromUserIndex.total.minus(event.params.value)
    toUserIndex.total = toUserIndex.total.plus(event.params.value)

    transferType = 'Send'
  }

  fromUserIndex.save()
  toUserIndex.save()

  let transfer = new Transfer(
    event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(BigInt.fromI32(transfers.length).toString())
  )

  transfer.index = event.address.toHexString()
  transfer.transaction = tx.id
  transfer.timestamp = tx.timestamp
  transfer.type = transferType
  transfer.from = from
  transfer.to = to
  transfer.value = event.params.value
  transfer.save()

  tx.transfers = transfers.concat([transfer.id])
  tx.save()
}
