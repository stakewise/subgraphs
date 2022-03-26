import { readFile, writeFileSync } from "fs";

const configName = process.env.CONFIG;

const _getDistributorRedirectedFrom = (data) => {
  const name = "DISTRIBUTOR_REDIRECTED_FROM";

  let rows = "";

  if (data) {
    rows = Object.keys(data).reduce((acc, key) => {
      const items = data[key]
        .map((item) => `Bytes.fromHexString('${item}')`)
        .join(",");

      return (acc += `\n${name}.set('${key}', [${items}])`);
    }, "");
  }

  return `
export let ${name} = new Map<string, Array<Bytes>>()
${rows}
  `;
};

readFile(`../../config/${configName}.json`, "utf8", (err, data) => {
  if (err) {
    console.log("Error:", err);
    return;
  }

  const parsedData = JSON.parse(data);

  const result = `
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

export let ADDRESS_ZERO = Address.zero();
export let BIG_INT_ZERO = BigInt.zero();
export let BIG_INT_ONE = BigInt.fromString("1");
export let BIG_INT_1E18 = BigInt.fromString("1000000000000000000");
export let BIG_INT_1E6 = BigInt.fromString("1000000");
export let BYTES_ZERO = Bytes.empty();


export let STAKED_ETH_TOKEN_ADDRESS = Address.fromString(
  "${
    parsedData.staked_eth_token_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let REWARD_ETH_TOKEN_ADDRESS = Address.fromString(
  "${
    parsedData.reward_eth_token_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let STAKEWISE_TOKEN_ADDRESS = Address.fromString(
  "${
    parsedData.stakewise_token_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let MERKLE_DISTRIBUTOR_ADDRESS = Address.fromString(
  "${
    parsedData.merkle_distributor_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let MERKLE_DROP_ADDRESS = Address.fromString(
  "${
    parsedData.merkle_drop_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let DAO_ADDRESS = Address.fromString(
  "${parsedData.dao_address || "0x0000000000000000000000000000000000000000"}"
);

export let FUTURE_FUND_ADDRESS = Address.fromString(
  "${
    parsedData.future_fund_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let UNISWAP_V3_FACTORY_ADDRESS = Address.fromString(
  "${
    parsedData.uniswap_v3_factory_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let UNISWAP_V3_POSITION_MANAGER_ADDRESS = Address.fromString(
  "${
    parsedData.uniswap_v3_position_manager_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let POOL_ADDRESS = Address.fromString(
  "${parsedData.pool_address || "0x0000000000000000000000000000000000000000"}"
);

export let VALIDATOR_REGISTRATION_ADDRESS = Address.fromString(
  "${
    parsedData.validator_registration_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let CONTRACT_CHECKER_ADDRESS = Address.fromString(
  "${
    parsedData.contract_checker_address ||
    "0x0000000000000000000000000000000000000000"
  }"
);

export let CONTRACT_CHECKER_DEPLOYMENT_BLOCK = BigInt.fromString(
  "${parsedData.contract_checker_deployment_block || "0"}"
);

export let ETHEREUM_VALIDATORS_DEPOSIT_ROOT_START_BLOCK = BigInt.fromString(
  "${parsedData.ethereum_validators_deposit_root_start_block || "0"}"
);

export let ORACLES_UPDATE_PERIOD = BigInt.fromString(
  "${parsedData.oracles_update_period || "0"}"
);

${_getDistributorRedirectedFrom(parsedData.distributor_redirected_from)}
  `;

  writeFileSync("./index.ts", result, (err) => {
    if (err) {
      console.log("Error:", err);
      return;
    }
  });
});
