import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, BYTES_ZERO } from "const";
import {
  Operator,
  Validator,
  OperatorAllocation,
} from "../../generated/schema";
import {
  calculateDistributorPoints,
  createOrLoadMerkleDistributor,
} from "./merkleDistributor";

export function createOrLoadOperator(
  operatorAddress: Address,
  currentBlock: BigInt
): Operator {
  let operatorId = operatorAddress.toHexString();
  let operator = Operator.load(operatorId);

  if (operator == null) {
    operator = new Operator(operatorId);

    operator.initializeMerkleRoot = BYTES_ZERO;
    operator.initializeMerkleProofs = "";
    operator.finalizeMerkleRoot = BYTES_ZERO;
    operator.finalizeMerkleProofs = "";
    operator.collateral = BIG_INT_ZERO;
    operator.committed = false;
    operator.locked = false;
    operator.validatorsCount = BIG_INT_ZERO;
    operator.allocationsCount = BIG_INT_ZERO;
    operator.depositDataIndex = BIG_INT_ZERO;
    operator.revenueShare = BIG_INT_ZERO;
    operator.distributorPoints = BIG_INT_ZERO;
    operator.updatedAtBlock = BIG_INT_ZERO;
    operator.updatedAtTimestamp = BIG_INT_ZERO;
    operator.save();
  } else {
    let distributor = createOrLoadMerkleDistributor();
    operator.distributorPoints = calculateDistributorPoints(
      operator.revenueShare.times(operator.validatorsCount),
      operator.distributorPoints,
      operator.updatedAtBlock,
      distributor.rewardsUpdatedAtBlock,
      currentBlock
    );
  }
  return operator as Operator;
}

export function createOrLoadOperatorAllocation(
  allocationId: string,
  operatorId: string
): OperatorAllocation {
  let allocation = OperatorAllocation.load(allocationId);
  if (allocation == null) {
    allocation = new OperatorAllocation(allocationId);
    allocation.validatorsCount = BIG_INT_ZERO;
    allocation.operator = operatorId;
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
    validator.registrationStatus = "Uninitialized";
    validator.save();
  }
  return validator as Validator;
}
