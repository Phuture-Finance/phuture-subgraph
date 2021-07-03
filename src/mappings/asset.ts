import { RemoveAsset, UpdateAsset } from '../types/Asset/Asset'
import { Asset } from '../types/schema'
import { ZERO_BI } from './helpers'

export function handleRemoveAsset(event: RemoveAsset): void {
  let id = event.params.asset.toHexString()

  let asset = Asset.load(id)
  if (asset == null) {
    asset = new Asset(id)
  }

  asset.prev = event.params.prev.toHexString()
  asset.marketCap = ZERO_BI

  asset.save()
}

export function handleUpdateAsset(event: UpdateAsset): void {
  let id = event.params.asset.toHexString()

  let asset = Asset.load(id)
  if (asset == null) {
    asset = new Asset(id)
  }

  asset.prev = event.params.prev.toHexString()
  asset.marketCap = event.params.marketCap

  asset.save()
}
