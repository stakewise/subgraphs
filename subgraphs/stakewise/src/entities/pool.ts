import { Address, BigInt } from "@graphprotocol/graph-ts";

import { POOL_ADDRESS, BIG_DECIMAL_ZERO, BIG_INT_ZERO } from "const";
import { DepositActivation, Pool } from "../../generated/schema";

export function createOrLoadPool(): Pool {
  let poolAddress = POOL_ADDRESS.toHexString();
  let pool = Pool.load(poolAddress);

  if (pool == null) {
    pool = new Pool(poolAddress);

    pool.minActivatingDeposit = BIG_DECIMAL_ZERO;
    pool.pendingValidatorsLimit = BIG_INT_ZERO;
    pool.pendingValidators = BIG_INT_ZERO;
    pool.activatedValidators = BIG_INT_ZERO;
    pool.balance = BIG_DECIMAL_ZERO;
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
    activation.amount = BIG_DECIMAL_ZERO;
    activation.save();
  }

  return activation as DepositActivation;
}
