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
export const UNI_V3_ORACLE_ROLE = Bytes.fromHexString(
    'e227202e31a2a70f89eef3dc7c41fbf4edfae8bf01acf40e719faad1ec8b6e61',
);
export const UNI_V3_PATH_ORACLE_ROLE = Bytes.fromHexString(
    '95023b7bb0ba8cd791f7a72c9586613d786af77ed60f735edce7bc48cd0aff4d',
);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
