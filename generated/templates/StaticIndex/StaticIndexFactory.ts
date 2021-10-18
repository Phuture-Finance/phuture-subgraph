// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class IndexCreated extends ethereum.Event {
  get params(): IndexCreated__Params {
    return new IndexCreated__Params(this);
  }
}

export class IndexCreated__Params {
  _event: IndexCreated;

  constructor(event: IndexCreated) {
    this._event = event;
  }

  get index(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get assets(): Array<Address> {
    return this._event.parameters[1].value.toAddressArray();
  }

  get weights(): Array<i32> {
    return this._event.parameters[2].value.toI32Array();
  }

  get indexCount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class StaticIndexFactory__defaultIndexTransferFeeResult {
  value0: Address;
  value1: BigInt;

  constructor(value0: Address, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class StaticIndexFactory__indexTransferFeeResult {
  value0: Address;
  value1: BigInt;

  constructor(value0: Address, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class StaticIndexFactory extends ethereum.SmartContract {
  static bind(address: Address): StaticIndexFactory {
    return new StaticIndexFactory("StaticIndexFactory", address);
  }

  createIndex(
    _assets: Array<Address>,
    _weights: Array<i32>,
    _name: string,
    _symbol: string,
    _imageURI: string
  ): Address {
    let result = super.call(
      "createIndex",
      "createIndex(address[],uint8[],string,string,string):(address)",
      [
        ethereum.Value.fromAddressArray(_assets),
        ethereum.Value.fromI32Array(_weights),
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(_imageURI)
      ]
    );

    return result[0].toAddress();
  }

  try_createIndex(
    _assets: Array<Address>,
    _weights: Array<i32>,
    _name: string,
    _symbol: string,
    _imageURI: string
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "createIndex",
      "createIndex(address[],uint8[],string,string,string):(address)",
      [
        ethereum.Value.fromAddressArray(_assets),
        ethereum.Value.fromI32Array(_weights),
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(_imageURI)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  defaultIndexTransferFee(): StaticIndexFactory__defaultIndexTransferFeeResult {
    let result = super.call(
      "defaultIndexTransferFee",
      "defaultIndexTransferFee():(address,uint256)",
      []
    );

    return new StaticIndexFactory__defaultIndexTransferFeeResult(
      result[0].toAddress(),
      result[1].toBigInt()
    );
  }

  try_defaultIndexTransferFee(): ethereum.CallResult<
    StaticIndexFactory__defaultIndexTransferFeeResult
  > {
    let result = super.tryCall(
      "defaultIndexTransferFee",
      "defaultIndexTransferFee():(address,uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new StaticIndexFactory__defaultIndexTransferFeeResult(
        value[0].toAddress(),
        value[1].toBigInt()
      )
    );
  }

  indexAt(_position: BigInt): Address {
    let result = super.call("indexAt", "indexAt(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(_position)
    ]);

    return result[0].toAddress();
  }

  try_indexAt(_position: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("indexAt", "indexAt(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(_position)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  indexCount(): BigInt {
    let result = super.call("indexCount", "indexCount():(uint256)", []);

    return result[0].toBigInt();
  }

  try_indexCount(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("indexCount", "indexCount():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  indexExists(_index: Address): boolean {
    let result = super.call("indexExists", "indexExists(address):(bool)", [
      ethereum.Value.fromAddress(_index)
    ]);

    return result[0].toBoolean();
  }

  try_indexExists(_index: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("indexExists", "indexExists(address):(bool)", [
      ethereum.Value.fromAddress(_index)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  indexTransferFee(
    _index: Address
  ): StaticIndexFactory__indexTransferFeeResult {
    let result = super.call(
      "indexTransferFee",
      "indexTransferFee(address):(address,uint256)",
      [ethereum.Value.fromAddress(_index)]
    );

    return new StaticIndexFactory__indexTransferFeeResult(
      result[0].toAddress(),
      result[1].toBigInt()
    );
  }

  try_indexTransferFee(
    _index: Address
  ): ethereum.CallResult<StaticIndexFactory__indexTransferFeeResult> {
    let result = super.tryCall(
      "indexTransferFee",
      "indexTransferFee(address):(address,uint256)",
      [ethereum.Value.fromAddress(_index)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new StaticIndexFactory__indexTransferFeeResult(
        value[0].toAddress(),
        value[1].toBigInt()
      )
    );
  }

  registry(): Address {
    let result = super.call("registry", "registry():(address)", []);

    return result[0].toAddress();
  }

  try_registry(): ethereum.CallResult<Address> {
    let result = super.tryCall("registry", "registry():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  vault(): Address {
    let result = super.call("vault", "vault():(address)", []);

    return result[0].toAddress();
  }

  try_vault(): ethereum.CallResult<Address> {
    let result = super.tryCall("vault", "vault():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _vault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _registry(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CreateIndexCall extends ethereum.Call {
  get inputs(): CreateIndexCall__Inputs {
    return new CreateIndexCall__Inputs(this);
  }

  get outputs(): CreateIndexCall__Outputs {
    return new CreateIndexCall__Outputs(this);
  }
}

export class CreateIndexCall__Inputs {
  _call: CreateIndexCall;

  constructor(call: CreateIndexCall) {
    this._call = call;
  }

  get _assets(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get _weights(): Array<i32> {
    return this._call.inputValues[1].value.toI32Array();
  }

  get _name(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _symbol(): string {
    return this._call.inputValues[3].value.toString();
  }

  get _imageURI(): string {
    return this._call.inputValues[4].value.toString();
  }
}

export class CreateIndexCall__Outputs {
  _call: CreateIndexCall;

  constructor(call: CreateIndexCall) {
    this._call = call;
  }

  get index(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}

export class SetDefaultIndexTransferFeeCall extends ethereum.Call {
  get inputs(): SetDefaultIndexTransferFeeCall__Inputs {
    return new SetDefaultIndexTransferFeeCall__Inputs(this);
  }

  get outputs(): SetDefaultIndexTransferFeeCall__Outputs {
    return new SetDefaultIndexTransferFeeCall__Outputs(this);
  }
}

export class SetDefaultIndexTransferFeeCall__Inputs {
  _call: SetDefaultIndexTransferFeeCall;

  constructor(call: SetDefaultIndexTransferFeeCall) {
    this._call = call;
  }

  get _feeRecipient(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _feeInBP(): i32 {
    return this._call.inputValues[1].value.toI32();
  }
}

export class SetDefaultIndexTransferFeeCall__Outputs {
  _call: SetDefaultIndexTransferFeeCall;

  constructor(call: SetDefaultIndexTransferFeeCall) {
    this._call = call;
  }
}

export class SetIndexTransferFeeCall extends ethereum.Call {
  get inputs(): SetIndexTransferFeeCall__Inputs {
    return new SetIndexTransferFeeCall__Inputs(this);
  }

  get outputs(): SetIndexTransferFeeCall__Outputs {
    return new SetIndexTransferFeeCall__Outputs(this);
  }
}

export class SetIndexTransferFeeCall__Inputs {
  _call: SetIndexTransferFeeCall;

  constructor(call: SetIndexTransferFeeCall) {
    this._call = call;
  }

  get _index(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _feeRecipient(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _feeInBP(): i32 {
    return this._call.inputValues[2].value.toI32();
  }
}

export class SetIndexTransferFeeCall__Outputs {
  _call: SetIndexTransferFeeCall;

  constructor(call: SetIndexTransferFeeCall) {
    this._call = call;
  }
}
