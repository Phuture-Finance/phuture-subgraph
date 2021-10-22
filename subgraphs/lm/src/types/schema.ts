// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class VestingRange extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("account", Value.fromString(""));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("rangeStartIndex", Value.fromBigInt(BigInt.zero()));
    this.set("rangeEndIndex", Value.fromBigInt(BigInt.zero()));
    this.set("unstaked", Value.fromBoolean(false));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save VestingRange entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save VestingRange entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("VestingRange", id.toString(), this);
    }
  }

  static load(id: string): VestingRange | null {
    return changetype<VestingRange | null>(store.get("VestingRange", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    return value!.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get rangeStartIndex(): BigInt {
    let value = this.get("rangeStartIndex");
    return value!.toBigInt();
  }

  set rangeStartIndex(value: BigInt) {
    this.set("rangeStartIndex", Value.fromBigInt(value));
  }

  get rangeEndIndex(): BigInt {
    let value = this.get("rangeEndIndex");
    return value!.toBigInt();
  }

  set rangeEndIndex(value: BigInt) {
    this.set("rangeEndIndex", Value.fromBigInt(value));
  }

  get unstaked(): boolean {
    let value = this.get("unstaked");
    return value!.toBoolean();
  }

  set unstaked(value: boolean) {
    this.set("unstaked", Value.fromBoolean(value));
  }
}

export class APR extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("n", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("Wn", Value.fromBigDecimal(BigDecimal.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save APR entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save APR entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("APR", id.toString(), this);
    }
  }

  static load(id: string): APR | null {
    return changetype<APR | null>(store.get("APR", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get n(): BigDecimal {
    let value = this.get("n");
    return value!.toBigDecimal();
  }

  set n(value: BigDecimal) {
    this.set("n", Value.fromBigDecimal(value));
  }

  get Wn(): BigDecimal {
    let value = this.get("Wn");
    return value!.toBigDecimal();
  }

  set Wn(value: BigDecimal) {
    this.set("Wn", Value.fromBigDecimal(value));
  }
}

export class Total extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("APR", Value.fromBigDecimal(BigDecimal.zero()));
    this.set("reward", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Total entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Total entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Total", id.toString(), this);
    }
  }

  static load(id: string): Total | null {
    return changetype<Total | null>(store.get("Total", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get APR(): BigDecimal {
    let value = this.get("APR");
    return value!.toBigDecimal();
  }

  set APR(value: BigDecimal) {
    this.set("APR", Value.fromBigDecimal(value));
  }

  get reward(): BigInt {
    let value = this.get("reward");
    return value!.toBigInt();
  }

  set reward(value: BigInt) {
    this.set("reward", Value.fromBigInt(value));
  }
}

export class Reward extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("amount", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Reward entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Reward entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Reward", id.toString(), this);
    }
  }

  static load(id: string): Reward | null {
    return changetype<Reward | null>(store.get("Reward", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }
}

export class Reserve extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("totalSupply", Value.fromBigInt(BigInt.zero()));
    this.set("token0", Value.fromString(""));
    this.set("token1", Value.fromString(""));
    this.set("token0Decimals", Value.fromBigInt(BigInt.zero()));
    this.set("token1Decimals", Value.fromBigInt(BigInt.zero()));
    this.set("reserve0", Value.fromBigInt(BigInt.zero()));
    this.set("reserve1", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Reserve entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Reserve entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Reserve", id.toString(), this);
    }
  }

  static load(id: string): Reserve | null {
    return changetype<Reserve | null>(store.get("Reserve", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get totalSupply(): BigInt {
    let value = this.get("totalSupply");
    return value!.toBigInt();
  }

  set totalSupply(value: BigInt) {
    this.set("totalSupply", Value.fromBigInt(value));
  }

  get token0(): string {
    let value = this.get("token0");
    return value!.toString();
  }

  set token0(value: string) {
    this.set("token0", Value.fromString(value));
  }

  get token1(): string {
    let value = this.get("token1");
    return value!.toString();
  }

  set token1(value: string) {
    this.set("token1", Value.fromString(value));
  }

  get token0Decimals(): BigInt {
    let value = this.get("token0Decimals");
    return value!.toBigInt();
  }

  set token0Decimals(value: BigInt) {
    this.set("token0Decimals", Value.fromBigInt(value));
  }

  get token1Decimals(): BigInt {
    let value = this.get("token1Decimals");
    return value!.toBigInt();
  }

  set token1Decimals(value: BigInt) {
    this.set("token1Decimals", Value.fromBigInt(value));
  }

  get reserve0(): BigInt {
    let value = this.get("reserve0");
    return value!.toBigInt();
  }

  set reserve0(value: BigInt) {
    this.set("reserve0", Value.fromBigInt(value));
  }

  get reserve1(): BigInt {
    let value = this.get("reserve1");
    return value!.toBigInt();
  }

  set reserve1(value: BigInt) {
    this.set("reserve1", Value.fromBigInt(value));
  }
}
