import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, BYTES_ZERO } from "const";
import {
  Operator,
  Validator,
  OperatorAllocation,
} from "../../generated/schema";
import { calculateDistributorPoints } from "./merkleDistributor";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function createOrLoadOperator(
  operatorAddress: Address,
  currentBlock: BigInt
): Operator {
  let operatorId = operatorAddress.toHexString();
  let operator = Operator.load(operatorId);

  if (operator == null) {
    operator = new Operator(operatorId);

    operator.depositDataMerkleRoot = BYTES_ZERO;
    operator.depositDataMerkleProofs = "";
    operator.committed = false;
    operator.validatorsCount = BIG_INT_ZERO;
    operator.allocationsCount = BIG_INT_ZERO;
    operator.depositDataIndex = BIG_INT_ZERO;
    operator.revenueShare = BIG_INT_ZERO;
    operator.distributorPoints = BIG_INT_ZERO;
    operator.updatedAtBlock = BIG_INT_ZERO;
    operator.updatedAtTimestamp = BIG_INT_ZERO;
    operator.save();
  } else {
    let rewardEthToken = createOrLoadRewardEthToken();
    operator.distributorPoints = calculateDistributorPoints(
      operator.revenueShare.times(operator.validatorsCount),
      operator.distributorPoints,
      operator.updatedAtBlock,
      rewardEthToken.updatedAtBlock,
      currentBlock
    );
  }
  return operator as Operator;
}

export function createOrLoadOperatorAllocation(
  operator: Operator
): OperatorAllocation {
  let allocationId = operator.id
    .concat("-")
    .concat(operator.allocationsCount.toString());
  let allocation = OperatorAllocation.load(allocationId);
  if (allocation == null) {
    allocation = new OperatorAllocation(allocationId);
    allocation.validatorsCount = BIG_INT_ZERO;
    allocation.operator = operator.id;
    allocation.save();
  }
  return allocation as OperatorAllocation;
}

export function createOrLoadValidator(publicKey: Bytes): Validator {
  let validatorId = publicKey.toHexString();
  let validator = Validator.load(validatorId);

  if (validator == null) {
    validator = new Validator(validatorId);

    validator.operator = "";
    validator.createdAtBlock = BIG_INT_ZERO;
    validator.createdAtTimestamp = BIG_INT_ZERO;
    validator.save();
  }
  return validator as Validator;
}
