import { RemoveAsset, UpdateAsset } from '../types/Asset/Asset'
import { createAsset, createTransaction, ZERO_BI } from './helpers'

export function handleRemoveAsset(event: RemoveAsset): void {
  createTransaction(event)

  let asset = createAsset(event.params.asset)

  asset.prev = event.params.prev.toHexString()
  asset.marketCap = ZERO_BI
  asset.isWhitelisted = false

  asset.save()
}

export function handleUpdateAsset(event: UpdateAsset): void {
  createTransaction(event)

  let asset = createAsset(event.params.asset)

  asset.prev = event.params.prev.toHexString()
  asset.marketCap = event.params.marketCap
  asset.isWhitelisted = true

  asset.save()
}
