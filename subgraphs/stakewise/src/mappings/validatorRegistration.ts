import { log } from "@graphprotocol/graph-ts";
import { DepositEvent } from "../../generated/ValidatorRegistration/ValidatorRegistration";
import { ValidatorRegistration } from "../../generated/schema";

export function handleDepositEvent(event: DepositEvent): void {
  let publicKey = event.params.pubkey.toHexString();
  let validator = ValidatorRegistration.load(publicKey);

  if (validator == null) {
    validator = new ValidatorRegistration(publicKey);
    validator.withdrawalCredentials = event.params.withdrawal_credentials;
    validator.save();
  }

  log.info("[VRC] DepositEvent publicKey={} withdrawalCredentials={}", [
    validator.id,
    validator.withdrawalCredentials.toHexString(),
  ]);
}
