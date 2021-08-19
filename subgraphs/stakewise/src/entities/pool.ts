import {
  Address,
  BigDecimal,
  BigInt,
  dataSource,
} from "@graphprotocol/graph-ts";

import { DepositActivation, Pool } from "../../generated/schema";

export function createOrLoadPool(): Pool {
  const poolAddress = dataSource.address().toHexString();
  let pool = Pool.load(poolAddress);

  if (!pool) {
    pool = new Pool(poolAddress);

    pool.minActivatingDeposit = BigDecimal.fromString("0");
    pool.pendingValidatorsLimit = 0;
    pool.pendingValidators = 0;
    pool.activatedValidators = 0;
    pool.save();
  }
  return pool as Pool;
}

export function getDepositActivationId(
  account: Address,
  validatorIndex: BigInt
): string {
  return account.toHexString().concat("-", validatorIndex.toString());
}

export function createOrLoadDepositActivation(
  account: Address,
  validatorIndex: BigInt
): DepositActivation {
  const activationId = getDepositActivationId(account, validatorIndex);
  let activation = DepositActivation.load(activationId);

  if (!activation) {
    activation = new DepositActivation(activationId);

    activation.account = account;
    activation.validatorIndex = validatorIndex.toI32();
    activation.amount = BigDecimal.fromString("0");
    activation.save();
  }

  return activation as DepositActivation;
}
