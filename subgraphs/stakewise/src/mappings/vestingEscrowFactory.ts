import { log, store } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, STAKEWISE_TOKEN_ADDRESS } from "const";
import {
  Paused,
  Unpaused,
  VestingEscrowCreated,
} from "../../generated/VestingEscrowFactory/VestingEscrowFactory";
import { StakeWiseTokenHolder, VestingEscrow } from "../../generated/schema";
import { VestingEscrow as VestingEscrowTemplate } from "../../generated/templates";
import { createOrLoadNetwork } from "../entities";

export function handleVestingEscrowCreated(event: VestingEscrowCreated): void {
  let escrow = new VestingEscrow(event.params.escrow.toHexString());

  escrow.admin = event.params.admin;
  escrow.token = event.params.token;
  escrow.claimer = event.params.recipient;
  escrow.beneficiary = event.params.beneficiary;
  escrow.totalAmount = event.params.totalAmount;
  escrow.totalClaimed = BIG_INT_ZERO;
  escrow.startTimestamp = event.params.startTime;
  escrow.endTimestamp = event.params.endTime;
  escrow.cliffLength = event.params.cliffLength;
  escrow.isPaused = false;
  escrow.save();

  // create data source to track events of the new escrow contract
  VestingEscrowTemplate.create(event.params.escrow);

  if (escrow.token == STAKEWISE_TOKEN_ADDRESS) {
    // remove stakewise token holder to exclude escrows when calculating rewards
    let holder = StakeWiseTokenHolder.load(escrow.id);
    if (holder != null) {
      store.remove("StakeWiseTokenHolder", escrow.id);
    }
  }

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
