import { IndexCreated } from '../types/Index'
import { Index, IndexAsset, UserIndex } from '../types/schema'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { Transfer as TransferTemplate } from '../types/templates'
import { createTransaction, createUser, fetchTokenName, fetchTokenSymbol, ZERO_BI } from './helpers'

export function handleIndexCreated(event: IndexCreated): void {
  createTransaction(event)

  let indexId = event.params.index.toHexString()
  let index = new Index(indexId)

  let paramAssets = event.params.assets
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString()

    let indexAssetId = indexId.concat('-').concat(assetId)

    let indexAsset = new IndexAsset(indexAssetId)
    indexAsset.index = indexId
    log.info(assetId, [])
    indexAsset.asset = assetId
    indexAsset.save()
  }

  let paramWeights = event.params.weights
  let weights: BigInt[] = []
  for (let i = 0; i < paramWeights.length; i++) {
    weights.push(BigInt.fromI32(paramWeights[i]))
  }

  index.symbol = fetchTokenSymbol(event.params.index)
  index.name = fetchTokenName(event.params.index)
  index.weights = weights
  index.indexCount = event.params.indexCount
  index.createdAtBlockNumber = event.block.number
  index.createdAtTimestamp = event.block.timestamp

  createUser(event.transaction.from)

  let userIndexId = event.transaction.from.toHexString().concat('-').concat(event.params.index.toHexString())
  let userIndex = UserIndex.load(userIndexId)
  if (userIndex === null) {
    userIndex = new UserIndex(userIndexId)
    userIndex.index = event.params.index.toHexString()
    userIndex.user = event.transaction.from.toHexString()
    userIndex.total = ZERO_BI
  }

  userIndex.save()

  TransferTemplate.create(event.params.index)

  index.save()
}
