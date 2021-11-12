import { log, store } from "@graphprotocol/graph-ts";

import { BIG_INT_ZERO } from "const";
import {
  createOrLoadNetwork,
  createOrLoadOperator,
  loadPartner,
} from "../entities";
import { Partner } from "../../generated/schema";
import {
  OperatorRemoved,
  OperatorUpdated,
  PartnerRemoved,
  PartnerUpdated,
  Paused,
  Unpaused,
} from "../../generated/Roles/Roles";

export function handleOperatorUpdated(event: OperatorUpdated): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  operator.revenueShare = event.params.revenueShare;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[Roles] OperatorUpdated sender={} operator={} revenueShare={}", [
    event.transaction.from.toHexString(),
    operator.id,
    operator.revenueShare.toString(),
  ]);
}

export function handleOperatorRemoved(event: OperatorRemoved): void {
  let operator = createOrLoadOperator(
    event.params.operator,
    event.block.number
  );

  // keep the operator entry as it's still used for provisioning validators
  operator.revenueShare = BIG_INT_ZERO;
  operator.updatedAtBlock = event.block.number;
  operator.updatedAtTimestamp = event.block.timestamp;
  operator.save();

  log.info("[Roles] OperatorRemoved sender={} operator={}", [
    event.transaction.from.toHexString(),
    operator.id,
  ]);
}

export function handlePartnerUpdated(event: PartnerUpdated): void {
  let partner = loadPartner(event.params.partner, event.block.number);
  if (partner == null) {
    partner = new Partner(event.params.partner.toHexString());
    partner.contributedAmount = BIG_INT_ZERO;
    partner.distributorPoints = BIG_INT_ZERO;
  }

  partner.revenueShare = event.params.revenueShare;
  partner.updatedAtBlock = event.block.number;
  partner.updatedAtTimestamp = event.block.timestamp;
  partner.save();

  log.info("[Roles] PartnerUpdated sender={} partner={} revenueShare={}", [
    event.transaction.from.toHexString(),
    partner.id,
    partner.revenueShare.toString(),
  ]);
}

export function handlePartnerRemoved(event: PartnerRemoved): void {
  let partner = loadPartner(event.params.partner, event.block.number);
  if (partner != null) {
    store.remove("Partner", partner.id);
  }

  log.info("[Roles] PartnerRemoved sender={} partner={}", [
    event.transaction.from.toHexString(),
    event.params.partner.toHexString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.rolesPaused = true;
  network.save();

  log.info("[Roles] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.rolesPaused = false;
  network.save();

  log.info("[Roles] Unpaused account={}", [event.params.account.toHexString()]);
}
