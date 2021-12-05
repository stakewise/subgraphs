import { log } from "@graphprotocol/graph-ts";

import { BIG_INT_ZERO } from "const";
import {
  createOrLoadMerkleDistributor,
  createOrLoadMerkleRootSnapshot,
  createOrLoadNetwork,
  createOrLoadRewardEthToken,
} from "../entities";
import { DistributionAdded } from "../../generated/MerkleDistributorV1/MerkleDistributorV1";
import {
  MerkleDistributorClaim,
  PeriodicDistribution,
  OneTimeDistribution,
} from "../../generated/schema";
import {
  OneTimeDistributionAdded,
  PeriodicDistributionAdded,
  MerkleRootUpdated,
  Claimed,
  Paused,
  Unpaused,
} from "../../generated/MerkleDistributorV2/MerkleDistributorV2";

export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  let distributor = createOrLoadMerkleDistributor();
  let rewardEthToken = createOrLoadRewardEthToken();

  let snapshotId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());
  createOrLoadMerkleRootSnapshot(
    snapshotId,
    event.params.merkleRoot,
    event.params.merkleProofs,
    rewardEthToken.updatedAtBlock,
    event.block
  );

  distributor.merkleRoot = event.params.merkleRoot;
  distributor.merkleProofs = event.params.merkleProofs;
  distributor.updatedAtBlock = event.block.number;
  distributor.updatedAtTimestamp = event.block.timestamp;
  distributor.rewardsUpdatedAtBlock = rewardEthToken.updatedAtBlock;
  distributor.save();

  // reset the period rewards as merkle rewards were distributed
  rewardEthToken.distributorPeriodReward = BIG_INT_ZERO;
  rewardEthToken.protocolPeriodReward = BIG_INT_ZERO;
  rewardEthToken.save();

  log.info(
    "[MerkleDistributor] MerkleRootUpdated merkleRoot={} merkleProofs={} sender={}",
    [
      distributor.merkleRoot.toHexString(),
      distributor.merkleProofs,
      event.params.sender.toHexString(),
    ]
  );
}

export function handlePeriodicDistributionAddedV1(
  event: DistributionAdded
): void {
  let distributionId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

  let distribution = new PeriodicDistribution(distributionId);

  distribution.token = event.params.token;
  distribution.beneficiary = event.params.beneficiary;

  distribution.amount = event.params.amount;
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

export function handlePeriodicDistributionAddedV2(
  event: PeriodicDistributionAdded
): void {
  let distributionId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

  let distribution = new PeriodicDistribution(distributionId);

  distribution.token = event.params.token;
  distribution.beneficiary = event.params.beneficiary;

  distribution.amount = event.params.amount;
  distribution.startedAtBlock = event.block.number;
  distribution.startedAtTimestamp = event.block.timestamp;
  distribution.endedAtBlock = event.params.endBlock;
  distribution.save();

  log.info(
    "[MerkleDistributor] PeriodicDistributionAdded from={} token={} beneficiary={} amount={} startBlock={} endBlock={} sender={}",
    [
      event.params.from.toHexString(),
      distribution.token.toHexString(),
      distribution.beneficiary.toHexString(),
      distribution.amount.toString(),
      event.params.startBlock.toString(),
      event.params.endBlock.toString(),
      event.transaction.from.toHexString(),
    ]
  );
}

export function handleOneTimeDistributionAdded(
  event: OneTimeDistributionAdded
): void {
  let distributionId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

  let distribution = new OneTimeDistribution(distributionId);

  distribution.token = event.params.token;
  distribution.origin = event.params.origin;
  distribution.amount = event.params.amount;
  distribution.rewardsLink = event.params.rewardsLink;
  distribution.distributedAtBlock = event.block.number;
  distribution.distributedAtTimestamp = event.block.timestamp;
  distribution.save();

  log.info(
    "[MerkleDistributor] OneTimeDistributionAdded from={} token={} origin={} amount={} startBlock={} sender={}",
    [
      event.params.from.toHexString(),
      distribution.token.toHexString(),
      distribution.origin.toHexString(),
      distribution.amount.toString(),
      distribution.distributedAtBlock.toString(),
      event.transaction.from.toHexString(),
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
  let network = createOrLoadNetwork();

  network.merkleDistributorPaused = true;
  network.save();

  log.info("[MerkleDistributor] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.merkleDistributorPaused = false;
  network.save();

  log.info("[MerkleDistributor] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
