import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Asset, Pair, Transaction, User } from '../../types/schema'
import { TokenDefinition } from './tokenDefinition'
import { ERC20 } from '../../types/UniswapFactory/ERC20'
import { ERC20SymbolBytes } from '../../types/Index/ERC20SymbolBytes'
import { ERC20NameBytes } from '../../types/Index/ERC20NameBytes'
import { UniswapFactory as FactoryContract } from '../../types/templates/UniswapPair/UniswapFactory'
import { ADDRESS_ZERO, FACTORY_ADDRESS } from '../../consts'

export let Q112 = BigInt.fromI32(2).pow(112).toBigDecimal()
export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = ONE_BD

  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }

  return bd
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }

  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if (staticDefinition != null) {
    return (staticDefinition as TokenDefinition).symbol
  }

  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if (staticDefinition != null) {
    return (staticDefinition as TokenDefinition).name
  }

  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress)
  let totalSupplyValue = null
  let totalSupplyResult = contract.try_totalSupply()
  if (!totalSupplyResult.reverted) {
    totalSupplyValue = totalSupplyResult as i32
  }
  return BigInt.fromI32(totalSupplyValue as i32)
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  // static definitions overrides
  let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
  if (staticDefinition != null) {
    return (staticDefinition as TokenDefinition).decimals
  }

  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = null
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  return BigInt.fromI32(decimalValue as i32)
}

export function createUser(address: Address): void {
  if (address.toHexString() == ADDRESS_ZERO) {
    return
  }

  let user = User.load(address.toHexString())

  if (user === null) {
    user = new User(address.toHexString())

    user.save()
  }
}

export function createAsset(address: Address): Asset {
  let addr = address.toHexString()

  let asset = Asset.load(addr)

  if (asset === null) {
    asset = new Asset(addr)
    asset.prev = ADDRESS_ZERO
    asset.marketCap = ZERO_BI
    asset.basePrice = ZERO_BD
    asset.isWhitelisted = false
    asset.symbol = fetchTokenSymbol(address)
    asset.name = fetchTokenName(address)
    asset.totalSupply = fetchTokenTotalSupply(address)
    asset.decimals = fetchTokenDecimals(address)
    asset.vaultReserve = ZERO_BD
    asset.vaultBaseReserve = ZERO_BD
    asset.indexCount = ZERO_BI
    asset._indexes = []

    asset.save()
  }

  return asset as Asset
}

export function createPair(pairAddr: Address, address0: string, address1: string): Pair {
  let id = pairAddr.toHexString()

  let pair = Pair.load(id)

  if (pair === null) {
    pair = new Pair(id)
    pair.asset0 = address0
    pair.asset1 = address1
    pair.totalSupply = ZERO_BI
    pair.asset0Reserve = ZERO_BD
    pair.asset1Reserve = ZERO_BD

    pair.save()
  }

  return pair as Pair
}

export function createTransaction(event: ethereum.Event): Transaction {
  let txHash = event.transaction.hash.toHexString()

  let tx = Transaction.load(txHash)

  if (tx === null) {
    tx = new Transaction(txHash)
    tx.blockNumber = event.block.number
    tx.timestamp = event.block.timestamp
    tx.transfers = []
    tx.value = event.transaction.value
    tx.gasPrice = event.transaction.gasPrice
    tx.gasUsed = event.transaction.gasUsed

    tx.save()
  }

  return tx as Transaction
}
