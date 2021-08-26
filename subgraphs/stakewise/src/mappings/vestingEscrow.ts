import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18 } from "const";
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

  let pulledAmount = event.params.amount.divDecimal(BIG_DECIMAL_1E18);
  escrow.totalClaimed = escrow.totalClaimed.plus(pulledAmount);
  escrow.save();

  log.info(
    "[VestingEscrow] Stopped escrow={} sender={} beneficiary={} amount={}",
    [
      escrow.id,
      event.params.sender.toHexString(),
      event.params.beneficiary.toHexString(),
      pulledAmount.toString(),
    ]
  );
}

export function handleClaimed(event: Claimed): void {
  let escrow = VestingEscrow.load(event.address.toHexString());

  if (escrow == null) {
    return;
  }

  let pulledAmount = event.params.amount.divDecimal(BIG_DECIMAL_1E18);
  escrow.totalClaimed = escrow.totalClaimed.plus(pulledAmount);
  escrow.save();

  log.info(
    "[VestingEscrow] Claimed escrow={} sender={} beneficiary={} amount={}",
    [
      escrow.id,
      event.params.sender.toHexString(),
      event.params.beneficiary.toHexString(),
      pulledAmount.toString(),
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
