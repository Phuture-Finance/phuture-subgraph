import { Bytes } from '@graphprotocol/graph-ts';

export const STATIC_TYPE = 'STATIC';
export const DYNAMIC_TYPE = 'DYNAMIC';

export const STATIC_TYPE_HASH = Bytes.fromHexString(
  '6e4abc02c6bd089c9bfc9d8a556bc8c00f2f250d7ff4335f79d29ac94792b8ab',
) as Bytes;
export const DYNAMIC_TYPE_HASH = Bytes.fromHexString(
  '8e7ab557453411baa0557b6b9366ce6b3deb7e655e18b37dac0905ba2af4c25b',
) as Bytes;
