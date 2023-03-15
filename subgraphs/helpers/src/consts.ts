import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts/index';

export const ONE_BI = BigInt.fromI32(1);
export const TWO_BI = BigInt.fromI32(2);
export const TEN_BI = BigInt.fromI32(10);
export const BP_BI = BigInt.fromI32(10000);

export const ONE_BD = new BigDecimal(ONE_BI);
export const TWO_BD = new BigDecimal(TWO_BI);
export const TEN_BD = new BigDecimal(TEN_BI);
export const BP_BD = new BigDecimal(BP_BI);

export const IndexManaged = 'managed';

export const FeeInBPMint = 'Mint';
export const FeeInBPBurn = 'Burn';
export const FeeAUM = 'AUM';

// keccak256("ASSET_ROLE")
export const ASSET_ROLE = Bytes.fromHexString(
  '86d5cf0a6bdc8d859ba3bdc97043337c82a0e609035f378e419298b6a3e00ae6',
);

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
