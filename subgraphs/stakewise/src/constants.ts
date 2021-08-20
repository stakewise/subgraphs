import { Address, BigDecimal, Bytes } from "@graphprotocol/graph-ts";

export let EMPTY_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export let EMPTY_BIG_DECIMAL = BigDecimal.fromString("0");
export let EMPTY_BYTES = Bytes.fromI32(0) as Bytes;
