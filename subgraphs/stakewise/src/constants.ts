import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";

export let EMPTY_BIG_DECIMAL = BigDecimal.fromString("0");
export let EMPTY_BIG_INT = BigInt.fromString("0");
export let EMPTY_BYTES = Bytes.fromI32(0) as Bytes;
export let BIG_DECIMAL_1E22 = BigDecimal.fromString("1e22");
export let BIG_DECIMAL_1E18 = BigDecimal.fromString("1e18");
export let BIG_DECIMAL_1E4 = BigDecimal.fromString("1e4");
