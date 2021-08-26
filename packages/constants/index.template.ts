import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";

export let ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export let BIG_DECIMAL_ZERO = BigDecimal.fromString("0");
export let BIG_INT_ZERO = BigInt.fromI32(0);
export let BYTES_ZERO = Bytes.fromI32(0) as Bytes;
export let BIG_DECIMAL_1E22 = BigDecimal.fromString("1e22");
export let BIG_DECIMAL_1E18 = BigDecimal.fromString("1e18");
export let BIG_DECIMAL_1E4 = BigDecimal.fromString("1e4");

export let STAKED_ETH_TOKEN_ADDRESS = Address.fromString(
  "{{ staked_eth_token_address }}{{^staked_eth_token_address}}0x0000000000000000000000000000000000000000{{/staked_eth_token_address}}"
);

export let REWARD_ETH_TOKEN_ADDRESS = Address.fromString(
  "{{ reward_eth_token_address }}{{^reward_eth_token_address}}0x0000000000000000000000000000000000000000{{/reward_eth_token_address}}"
);

export let STAKEWISE_TOKEN_ADDRESS = Address.fromString(
  "{{ stakewise_token_address }}{{^stakewise_token_address}}0x0000000000000000000000000000000000000000{{/stakewise_token_address}}"
);

export let UNISWAP_V3_FACTORY_ADDRESS = Address.fromString(
  "{{ uniswap_v3_factory_address }}{{^uniswap_v3_factory_address}}0x0000000000000000000000000000000000000000{{/uniswap_v3_factory_address}}"
);
