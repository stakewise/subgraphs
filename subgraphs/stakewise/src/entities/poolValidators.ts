import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, BYTES_ZERO } from "const";
import { Operator, Validator } from "../../generated/schema";

export function createOrLoadOperator(operatorAddress: string): Operator {
  let operator = Operator.load(operatorAddress);

  if (operator == null) {
    operator = new Operator(operatorAddress);

    operator.initializeMerkleRoot = BYTES_ZERO;
    operator.initializeMerkleProofs = "";
    operator.finalizeMerkleRoot = BYTES_ZERO;
    operator.finalizeMerkleProofs = "";
    operator.collateral = BIG_DECIMAL_ZERO;
    operator.validatorsCount = BIG_INT_ZERO;
    operator.depositDataIndex = BIG_INT_ZERO;
    operator.save();
  }
  return operator as Operator;
}

export function createOrLoadValidator(publicKey: string): Validator {
  let validator = Validator.load(publicKey);

  if (validator == null) {
    validator = new Validator(publicKey);

    validator.operator = "";
    validator.registrationStatus = "Uninitialized";
    validator.save();
  }
  return validator as Validator;
}
