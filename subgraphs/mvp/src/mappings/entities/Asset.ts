import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Asset } from '../../types/schema';
import { ERC20 } from '../../types/vToken/ERC20';
import { ERC20SymbolBytes } from '../../types/vToken/ERC20SymbolBytes';
import { ERC20NameBytes } from '../../types/vToken/ERC20NameBytes';
import { ONE_BD, ONE_BI } from '@phuture/subgraph-helpers';

export function loadOrCreateAsset(address: Address): Asset {
  let id = address.toHexString();

  let asset = Asset.load(id);
  if (asset == null) {
    asset = new Asset(id);
    asset.marketCap = BigInt.zero();
    asset.basePrice = BigDecimal.zero();
    asset.isWhitelisted = false;
    asset.symbol = fetchTokenSymbol(address);
    asset.name = fetchTokenName(address);
    asset.totalSupply = fetchTokenTotalSupply(address);
    asset.decimals = fetchTokenDecimals(address);
    asset.vaultReserve = BigDecimal.zero();
    asset.vaultBaseReserve = BigDecimal.zero();
    asset.indexCount = BigInt.zero();
    asset._indexes = [];

    asset.save();
  }

  return asset as Asset;
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001';
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  let symbolValue = 'UNKNOWN';
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted && !isNullEthValue(symbolResultBytes.value.toHexString())) {
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

  let nameValue = 'unknown';
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted && !isNullEthValue(nameResultBytes.value.toHexString())) {
      nameValue = nameResultBytes.value.toString();
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);

  let totalSupplyValue = BigInt.fromString('0');
  let totalSupplyResult = contract.try_totalSupply();
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult.value;
  }

  return totalSupplyValue;
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

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = ONE_BD;

  for (let i = BigInt.zero(); i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'));
  }

  return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BigInt.zero()) {
    return tokenAmount.toBigDecimal();
  }

  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
