import { BigDecimal, Bytes } from "@graphprotocol/graph-ts/index";

import { Operator, Validator } from "../../generated/schema";

export enum RegistrationStatus {
  Uninitialized = "Uninitialized",
  Initialized = "Initialized",
  Finalized = "Finalized",
  Failed = "Failed",
}

export function createOrLoadOperator(operatorAddress: string): Operator {
  let operator = Operator.load(operatorAddress);

  if (!operator) {
    operator = new Operator(operatorAddress);

    operator.initializeMerkleRoot = Bytes.fromI32(0);
    operator.initializeMerkleProofs = "";
    operator.finalizeMerkleRoot = Bytes.fromI32(0);
    operator.finalizeMerkleProofs = "";
    operator.collateral = BigDecimal.fromString("0");
    operator.save();
  }
  return operator as Operator;
}

export function createOrLoadValidator(publicKey: string): Validator {
  let validator = Validator.load(publicKey);

  if (!validator) {
    validator = new Validator(publicKey);

    validator.operator = "";
    validator.registrationStatus = RegistrationStatus.Uninitialized;
    validator.save();
  }
  return validator as Validator;
}
