import { Operator, Validator } from "../../generated/schema";
import { EMPTY_BIG_DECIMAL, EMPTY_BYTES } from "../constants";

export function createOrLoadOperator(operatorAddress: string): Operator {
  let operator = Operator.load(operatorAddress);

  if (!operator) {
    operator = new Operator(operatorAddress);

    operator.initializeMerkleRoot = EMPTY_BYTES;
    operator.initializeMerkleProofs = "";
    operator.finalizeMerkleRoot = EMPTY_BYTES;
    operator.finalizeMerkleProofs = "";
    operator.collateral = EMPTY_BIG_DECIMAL;
    operator.save();
  }
  return operator as Operator;
}

export function createOrLoadValidator(publicKey: string): Validator {
  let validator = Validator.load(publicKey);

  if (!validator) {
    validator = new Validator(publicKey);

    validator.operator = "";
    validator.registrationStatus = "Uninitialized";
    validator.save();
  }
  return validator as Validator;
}
