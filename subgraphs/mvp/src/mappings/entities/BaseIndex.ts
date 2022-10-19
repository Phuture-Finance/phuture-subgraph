import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

import { Index, IndexFactory } from '../../types/schema';

import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from './Asset';

export function loadOrCreateIndex(address: Address): Index {
  let index = Index.load(address.toHexString());
  if (!index) {
    index = new Index(address.toHexString());

    index.marketCap = BigDecimal.zero();
    index.baseVolume = BigDecimal.zero();
    index.uniqueHolders = BigInt.zero();
    index.basePrice = BigDecimal.zero();
    index._assets = [];

    index.totalSupply = BigInt.zero();
    index.decimals = fetchTokenDecimals(address);
    index.symbol = fetchTokenSymbol(address);
    index.name = fetchTokenName(address);

    index.save();
  }

  return index;
}

export function loadOrCreateIndexFactory(
  address: Address,
  type: string,
  vTokenF: Address,
): IndexFactory {
  let idxF = IndexFactory.load(address.toHexString());
  if (!idxF) {
    idxF = new IndexFactory(address.toHexString());
    idxF.type = type;
    idxF.vTokenFactory = vTokenF.toHexString();
    idxF.save();
  }

  return idxF;
}
