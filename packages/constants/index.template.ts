import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export let ADDRESS_ZERO = Address.zero();
export let BIG_INT_ZERO = BigInt.zero();
export let BIG_INT_1E18 = BigInt.fromString("1000000000000000000");
export let BIG_INT_1E6 = BigInt.fromString("1000000");
export let BYTES_ZERO = Bytes.empty();

export let STAKED_ETH_TOKEN_ADDRESS = Address.fromString(
  "{{ staked_eth_token_address }}{{^staked_eth_token_address}}0x0000000000000000000000000000000000000000{{/staked_eth_token_address}}"
);

export let REWARD_ETH_TOKEN_ADDRESS = Address.fromString(
  "{{ reward_eth_token_address }}{{^reward_eth_token_address}}0x0000000000000000000000000000000000000000{{/reward_eth_token_address}}"
);

export let STAKEWISE_TOKEN_ADDRESS = Address.fromString(
  "{{ stakewise_token_address }}{{^stakewise_token_address}}0x0000000000000000000000000000000000000000{{/stakewise_token_address}}"
);

export let MERKLE_DISTRIBUTOR_ADDRESS = Address.fromString(
  "{{ merkle_distributor_address }}{{^merkle_distributor_address}}0x0000000000000000000000000000000000000000{{/merkle_distributor_address}}"
);

export let MERKLE_DROP_ADDRESS = Address.fromString(
  "{{ merkle_drop_address }}{{^merkle_drop_address}}0x0000000000000000000000000000000000000000{{/merkle_drop_address}}"
);

export let DAO_ADDRESS = Address.fromString(
  "{{ dao_address }}{{^dao_address}}0x0000000000000000000000000000000000000000{{/dao_address}}"
);

export let FUTURE_FUND_ADDRESS = Address.fromString(
  "{{ future_fund_address }}{{^future_fund_address}}0x0000000000000000000000000000000000000000{{/future_fund_address}}"
);

export let UNISWAP_V3_FACTORY_ADDRESS = Address.fromString(
  "{{ uniswap_v3_factory_address }}{{^uniswap_v3_factory_address}}0x0000000000000000000000000000000000000000{{/uniswap_v3_factory_address}}"
);

export let UNISWAP_V3_POSITION_MANAGER_ADDRESS = Address.fromString(
  "{{ uniswap_v3_position_manager_address }}{{^uniswap_v3_position_manager_address}}0x0000000000000000000000000000000000000000{{/uniswap_v3_position_manager_address}}"
);

export let POOL_ADDRESS = Address.fromString(
  "{{ pool_address }}{{^pool_address}}0x0000000000000000000000000000000000000000{{/pool_address}}"
);

export let CONTRACT_CHECKER_ADDRESS = Address.fromString(
  "{{ contract_checker_address }}{{^contract_checker_address}}0x0000000000000000000000000000000000000000{{/contract_checker_address}}"
);

export let CONTRACT_CHECKER_DEPLOYMENT_BLOCK = BigInt.fromString(
  "{{ contract_checker_deployment_block }}{{^contract_checker_deployment_block}}0{{/contract_checker_deployment_block}}"
);

export let ORACLES_UPDATE_PERIOD = BigInt.fromString(
  "{{ oracles_update_period }}{{^oracles_update_period}}0{{/oracles_update_period}}"
);
