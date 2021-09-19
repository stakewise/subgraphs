import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18, BIG_DECIMAL_ZERO } from "const";
import {
  VestingEscrowCreated,
  Paused,
  Unpaused,
} from "../../generated/VestingEscrowFactory/VestingEscrowFactory";
import { VestingEscrow } from "../../generated/schema";
import { VestingEscrow as VestingEscrowTemplate } from "../../generated/templates";
import { createOrLoadNetwork } from "../entities";

export function handleVestingEscrowCreated(event: VestingEscrowCreated): void {
  let escrow = new VestingEscrow(event.params.escrow.toHexString());

  escrow.admin = event.params.admin;
  escrow.token = event.params.token;
  escrow.claimer = event.params.recipient;
  escrow.beneficiary = event.params.beneficiary;
  escrow.totalAmount = event.params.totalAmount.divDecimal(BIG_DECIMAL_1E18);
  escrow.totalClaimed = BIG_DECIMAL_ZERO;
  escrow.startTimestamp = event.params.startTime;
  escrow.endTimestamp = event.params.endTime;
  escrow.cliffLength = event.params.cliffLength;
  escrow.isPaused = false;
  escrow.save();

  // create data source to track events of the new escrow contract
  VestingEscrowTemplate.create(event.params.escrow);

  log.info(
    "[VestingEscrowFactory] VestingEscrowCreated escrow={} admin={} token={} recipient={} beneficiary={} totalAmount={} startTime={} endTime={} cliffLength={}",
    [
      escrow.id,
      escrow.admin.toHexString(),
      escrow.token.toHexString(),
      escrow.claimer.toHexString(),
      escrow.beneficiary.toHexString(),
      escrow.totalAmount.toString(),
      event.params.startTime.toString(),
      event.params.endTime.toString(),
      event.params.cliffLength.toString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.vestingEscrowFactoryPaused = true;
  network.save();

  log.info("[VestingEscrowFactory] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.vestingEscrowFactoryPaused = false;
  network.save();

  log.info("[VestingEscrowFactory] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
