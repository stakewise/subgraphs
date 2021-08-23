import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts";

import { DepositActivation, Pool } from "../../generated/schema";
import { EMPTY_BIG_DECIMAL, EMPTY_BIG_INT } from "../constants";

export function createOrLoadPool(): Pool {
  let poolAddress = dataSource.address().toHexString();
  let pool = Pool.load(poolAddress);

  if (pool == null) {
    pool = new Pool(poolAddress);

    pool.minActivatingDeposit = EMPTY_BIG_DECIMAL;
    pool.pendingValidatorsLimit = EMPTY_BIG_INT;
    pool.pendingValidators = EMPTY_BIG_INT;
    pool.activatedValidators = EMPTY_BIG_INT;
    pool.save();
  }
  return pool as Pool;
}

export function getDepositActivationId(
  account: Address,
  validatorIndex: BigInt
): string {
  return account.toHexString().concat("-").concat(validatorIndex.toString());
}

export function createOrLoadDepositActivation(
  account: Address,
  validatorIndex: BigInt
): DepositActivation {
  let activationId = getDepositActivationId(account, validatorIndex);
  let activation = DepositActivation.load(activationId);

  if (activation == null) {
    activation = new DepositActivation(activationId);

    activation.account = account;
    activation.validatorIndex = validatorIndex;
    activation.amount = EMPTY_BIG_DECIMAL;
    activation.save();
  }

  return activation as DepositActivation;
}
