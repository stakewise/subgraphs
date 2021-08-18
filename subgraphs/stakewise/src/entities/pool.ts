import {
  BigDecimal,
  ethereum,
  dataSource,
  BigInt,
  Address,
} from "@graphprotocol/graph-ts";
import { Pool, DepositActivation } from "../../generated/schema";

export function createOrLoadPool(block: ethereum.Block): Pool {
  let poolAddress = dataSource.address().toHexString();
  let pool = Pool.load(poolAddress);
  if (pool == null) {
    pool = new Pool(poolAddress);

    pool.isPaused = false;
    pool.minActivatingDeposit = BigDecimal.fromString("0");
    pool.pendingValidatorsLimit = 0;
    pool.pendingValidators = 0;
    pool.activatedValidators = 0;

    pool.save();
  }
  return pool as Pool;
}

export function createOrLoadDepositActivation(
  account: Address,
  validatorIndex: BigInt
): DepositActivation {
  let activationId = account
    .toHexString()
    .concat("-")
    .concat(validatorIndex.toString());
  let activation = DepositActivation.load(activationId);
  if (activation == null) {
    activation = new DepositActivation(activationId);

    activation.account = account;
    activation.validatorIndex = validatorIndex.toI32();
    activation.isActivated = false;
    activation.activationSender = Address.fromString(
      "0x0000000000000000000000000000000000000000"
    );
    activation.save();
  }

  return activation as DepositActivation;
}
