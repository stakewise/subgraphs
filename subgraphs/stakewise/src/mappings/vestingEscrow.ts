import { log } from "@graphprotocol/graph-ts";
import {
  Stopped,
  Paused,
  Unpaused,
  Claimed,
} from "../../generated/templates/VestingEscrow/VestingEscrow";
import { VestingEscrow } from "../../generated/schema";

export function handleStopped(event: Stopped): void {
  let escrow = VestingEscrow.load(event.address.toHexString());

  if (escrow == null) {
    return;
  }

  escrow.totalClaimed = escrow.totalClaimed.plus(event.params.amount);
  escrow.save();

  log.info(
    "[VestingEscrow] Stopped escrow={} sender={} beneficiary={} amount={}",
    [
      escrow.id,
      event.params.sender.toHexString(),
      event.params.beneficiary.toHexString(),
      event.params.amount.toString(),
    ]
  );
}

export function handleClaimed(event: Claimed): void {
  let escrow = VestingEscrow.load(event.address.toHexString());

  if (escrow == null) {
    return;
  }

  escrow.totalClaimed = escrow.totalClaimed.plus(event.params.amount);
  escrow.save();

  log.info(
    "[VestingEscrow] Claimed escrow={} sender={} beneficiary={} amount={}",
    [
      escrow.id,
      event.params.sender.toHexString(),
      event.params.beneficiary.toHexString(),
      event.params.amount.toString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let escrow = VestingEscrow.load(event.address.toHexString());
  if (escrow == null) {
    return;
  }

  escrow.isPaused = true;
  escrow.save();

  log.info("[VestingEscrow] Paused escrow={} account={}", [
    escrow.id,
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let escrow = VestingEscrow.load(event.address.toHexString());
  if (escrow == null) {
    return;
  }

  escrow.isPaused = false;
  escrow.save();

  log.info("[VestingEscrow] Unpaused escrow={} account={}", [
    escrow.id,
    event.params.account.toHexString(),
  ]);
}
