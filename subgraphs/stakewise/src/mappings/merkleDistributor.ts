import { log } from "@graphprotocol/graph-ts";

import {
  createOrLoadMerkleDistributor,
  createOrLoadSettings,
} from "../entities";
import {
  Claimed,
  DistributionAdded,
  MerkleRootUpdated,
  Paused,
  Unpaused,
} from "../../generated/MerkleDistributor/MerkleDistributor";
import {
  MerkleDistributorClaim,
  TokenDistribution,
} from "../../generated/schema";
import { BIG_DECIMAL_1E18 } from "../constants";

export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  let distributor = createOrLoadMerkleDistributor();

  distributor.merkleRoot = event.params.merkleRoot;
  distributor.merkleProofs = event.params.merkleProofs;
  distributor.updatedAtBlock = event.block.number;
  distributor.updatedAtTimestamp = event.block.timestamp;
  distributor.save();

  log.info(
    "[MerkleDistributor] MerkleRootUpdated merkleRoot={} merkleProofs={} sender={}",
    [
      distributor.merkleRoot.toHexString(),
      distributor.merkleProofs,
      event.params.sender.toHexString(),
    ]
  );
}

export function handleDistributionAdded(event: DistributionAdded): void {
  let distributionId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.transaction.index.toString());

  let distribution = new TokenDistribution(distributionId);

  distribution.token = event.params.token;
  distribution.beneficiary = event.params.beneficiary;

  // XXX: could be incorrect in case token has different from 18 decimals
  distribution.amount = event.params.amount.divDecimal(BIG_DECIMAL_1E18);
  distribution.startedAtBlock = event.block.number;
  distribution.startedAtTimestamp = event.block.timestamp;
  distribution.endedAtBlock = event.params.endBlock;
  distribution.save();

  log.info(
    "[MerkleDistributor] DistributionAdded token={} beneficiary={} amount={} startBlock={} endBlock={} sender={}",
    [
      distribution.token.toHexString(),
      distribution.beneficiary.toHexString(),
      distribution.amount.toString(),
      event.params.startBlock.toString(),
      event.params.endBlock.toString(),
      event.params.sender.toHexString(),
    ]
  );
}

export function handleClaimed(event: Claimed): void {
  // should exist by the time of calling
  let distributor = createOrLoadMerkleDistributor();

  let claimId = event.params.account
    .toHexString()
    .concat("-")
    .concat(distributor.merkleRoot.toHexString());

  let claim = new MerkleDistributorClaim(claimId);
  claim.account = event.params.account;
  claim.merkleRoot = distributor.merkleRoot;
  claim.merkleProofs = distributor.merkleProofs;
  claim.save();

  log.info(
    "[MerkleDistributor] Claimed account={} index={} merkleProofs={} sender={}",
    [
      claim.account.toHexString(),
      event.params.index.toString(),
      claim.merkleProofs,
      event.transaction.from.toHexString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.merkleDistributorPaused = true;
  settings.save();

  log.info("[MerkleDistributor] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.merkleDistributorPaused = false;
  settings.save();

  log.info("[MerkleDistributor] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
