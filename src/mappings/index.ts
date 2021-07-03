import { IndexCreated } from '../types/Index'
import { Index, IndexAsset } from '../types/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleIndexCreated(event: IndexCreated): void {
  let indexId = event.params.index.toHexString()
  let index = new Index(indexId)

  let paramAssets = event.params.assets
  for (let i = 0; i < paramAssets.length; i++) {
    let assetId = paramAssets[i].toHexString()

    let indexAssetId = indexId + assetId

    let indexAsset = new IndexAsset(indexAssetId)
    indexAsset.index = indexId
    indexAsset.asset = assetId
    indexAsset.save()
  }

  let paramWeights = event.params.weights
  let weights: BigInt[] = []
  for (let i = 0; i < paramWeights.length; i++) {
    weights.push(BigInt.fromI32(paramWeights[i]))
  }

  index.weights = weights

  index.indexCount = event.params.indexCount

  index.save()
}
