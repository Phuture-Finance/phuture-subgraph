import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

import { ChainLinkAssetMap } from '../../../consts';
import { Asset } from '../../types/schema';
import { ERC20 } from '../../types/templates/Asset/ERC20';
import { ERC20NameBytes } from '../../types/templates/Asset/ERC20NameBytes';
import { ERC20SymbolBytes } from '../../types/templates/Asset/ERC20SymbolBytes';

import { calculateChainLinkPrice, loadOrCreateChainLink } from './ChainLink';

export function loadOrCreateAsset(address: Address): Asset {
  let id = address.toHexString();

  let asset = Asset.load(id);
  if (!asset) {
    asset = new Asset(id);
    asset.basePrice = BigDecimal.zero();
    asset.isWhitelisted = false;
    asset.symbol = fetchTokenSymbol(address);
    asset.name = fetchTokenName(address);
    asset.decimals = fetchTokenDecimals(address);
    asset._indexes = [];

    // TODO: instead of this just fetch the price from the phuture price oracle contract.

    asset.save();
  }

  return asset as Asset;
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    '0x0000000000000000000000000000000000000000000000000000000000000001'
  );
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  let symbolValue = 'UNKNOWN';

  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (
      !symbolResultBytes.reverted &&
      !isNullEthValue(symbolResultBytes.value.toHexString())
    ) {
      symbolValue = symbolResultBytes.value.toString();
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  let nameValue = 'Unknown';

  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (
      !nameResultBytes.reverted &&
      !isNullEthValue(nameResultBytes.value.toHexString())
    ) {
      nameValue = nameResultBytes.value.toString();
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);

  let decimalValue = 0;

  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }

  return BigInt.fromI32(decimalValue);
}
