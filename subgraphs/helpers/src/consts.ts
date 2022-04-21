import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts/index';

export const ONE_BI = BigInt.fromI32(1);
export const ONE_BD = BigDecimal.fromString('1');

export const IndexManaged = 'managed';
export const IndexTracked = 'tracked';
export const IndexTopN = 'topN';

export const FeeInBPMint = 'Mint';
export const FeeInBPBurn = 'Burn';
export const FeeInBPAUM = 'AUM';

// keccak256("ASSET_ROLE)
export const ASSET_ROLE = Bytes.fromHexString('86d5cf0a6bdc8d859ba3bdc97043337c82a0e609035f378e419298b6a3e00ae6');
