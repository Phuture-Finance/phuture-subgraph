import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts/index';
import {
  assert,
  clearStore,
  newMockEvent,
  createMockedFunction,
  test,
} from 'matchstick-as/assembly/index';
import { logStore } from 'matchstick-as/assembly/store';

import {
  handleFCashMinted,
  handleFCashRedeemed,
} from '../src/mappings/frp/frp';
import {
  FCashMinted as FCashMintedEvent,
  FCashRedeemed as FCashRedeemedEvent,
} from '../src/types/FRPVault/FRPVault';

class FCashEvent {
  position: Address;
  assetAmount: BigInt;
  fCashAmount: BigInt;
  maturity: BigInt;
  timestamp: BigInt;
  isRedeem: boolean;
}

const eventList: FCashEvent[] = [
  {
    position: Address.fromString('0x69c6b313506684f49c564b48bf0e4d41c0cb1a3e'),
    assetAmount: BigInt.fromI64(1000000000),
    fCashAmount: BigInt.fromI64(100384615800),
    maturity: BigInt.fromI64(1664064000),
    timestamp: BigInt.fromI64(1659541873),
    isRedeem: false,
  },
  {
    position: Address.fromString('0x69c6b313506684f49c564b48bf0e4d41c0cb1a3e'),
    fCashAmount: BigInt.fromI64(20076921540),
    assetAmount: BigInt.fromI64(200000000),
    maturity: BigInt.fromI64(1664064000),
    timestamp: BigInt.fromI64(1659541877),
    isRedeem: false,
  },
  {
    position: Address.fromString('0x69c6b313506684f49c564b48bf0e4d41c0cb1a3e'),
    fCashAmount: BigInt.fromI64(5023711227),
    assetAmount: BigInt.fromI64(50001000),
    maturity: BigInt.fromI64(1664064000),
    timestamp: BigInt.fromI64(1659541879),
    isRedeem: true,
  },
  {
    position: Address.fromString('0x69c6b313506684f49c564b48bf0e4d41c0cb1a3e'),
    fCashAmount: BigInt.fromI64(5023610835),
    assetAmount: BigInt.fromI64(49999999),
    maturity: BigInt.fromI64(1664064000),
    timestamp: BigInt.fromI64(1659541881),
    isRedeem: true,
  },
  {
    position: Address.fromString('0x69c6b313506684f49c564b48bf0e4d41c0cb1a3e'),
    fCashAmount: BigInt.fromI64(5023611010),
    assetAmount: BigInt.fromI64(50000000),
    maturity: BigInt.fromI64(1664064000),
    timestamp: BigInt.fromI64(1659541883),
    isRedeem: true,
  },
];

test('Register fCash events', () => {
  const frpVaultAddr = Address.fromString(
    '0xf89aa2f1397e9a0622c8fc99ab1947e28b5ef876',
  );

  createMockedFunction(
    frpVaultAddr,
    'totalAssets',
    'totalAssets():(uint256)',
  ).returns([ethereum.Value.fromSignedBigInt(BigInt.fromI64(1000000000))]);
  createMockedFunction(
    frpVaultAddr,
    'totalSupply',
    'totalSupply():(uint256)',
  ).returns([
    ethereum.Value.fromSignedBigInt(BigInt.fromI64(1000000000000000000000)),
  ]);
  createMockedFunction(frpVaultAddr, 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString('USDC_VAULT'),
  ]);
  createMockedFunction(frpVaultAddr, 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromI32(18),
  ]);
  createMockedFunction(frpVaultAddr, 'name', 'name():(string)').returns([
    ethereum.Value.fromString('USDC Notional Vault Mock'),
  ]);

  eventList.forEach((event: FCashEvent) => {
    // FCashBase address mock function to receive maturity.
    createMockedFunction(
      event.position,
      'getMaturity',
      'getMaturity():(uint40)',
    ).returns([ethereum.Value.fromSignedBigInt(event.maturity)]);

    if (event.isRedeem) {
      const redeemEvent = changetype<FCashRedeemedEvent>(newMockEvent());
      redeemEvent.address = frpVaultAddr;
      redeemEvent.logIndex = BigInt.fromI32(1);
      redeemEvent.block.timestamp = event.timestamp;
      redeemEvent.parameters.push(
        new ethereum.EventParam(
          '_fCashPosition',
          ethereum.Value.fromAddress(event.position),
        ),
      );
      redeemEvent.parameters.push(
        new ethereum.EventParam(
          '_assetAmount',
          ethereum.Value.fromSignedBigInt(event.assetAmount),
        ),
      );
      redeemEvent.parameters.push(
        new ethereum.EventParam(
          '_fCashAmount',
          ethereum.Value.fromSignedBigInt(event.fCashAmount),
        ),
      );

      handleFCashRedeemed(redeemEvent);
      logStore();
    } else {
      const mintedEvent = changetype<FCashMintedEvent>(newMockEvent());
      mintedEvent.address = frpVaultAddr;
      mintedEvent.logIndex = BigInt.fromI32(1);
      mintedEvent.block.timestamp = event.timestamp;
      mintedEvent.parameters.push(
        new ethereum.EventParam(
          '_fCashPosition',
          ethereum.Value.fromAddress(event.position),
        ),
      );
      mintedEvent.parameters.push(
        new ethereum.EventParam(
          '_assetAmount',
          ethereum.Value.fromSignedBigInt(event.assetAmount),
        ),
      );
      mintedEvent.parameters.push(
        new ethereum.EventParam(
          '_fCashAmount',
          ethereum.Value.fromSignedBigInt(event.fCashAmount),
        ),
      );

      handleFCashMinted(mintedEvent);
      logStore();
    }
  });

  assert.fieldEquals(
    'FrpVault',
    frpVaultAddr.toHexString(),
    'apr',
    '0.01599301177669391899135591347481267',
  );

  clearStore();
});
