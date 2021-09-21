import { log } from "@graphprotocol/graph-ts";

import { BIG_DECIMAL_1E18, BIG_DECIMAL_ZERO } from "const";
import {
  createOrLoadMerkleDistributor,
  createOrLoadRewardEthToken,
  createOrLoadNetwork,
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

export function handleMerkleRootUpdated(event: MerkleRootUpdated): void {
  let distributor = createOrLoadMerkleDistributor();
  let rewardEthToken = createOrLoadRewardEthToken();

  distributor.merkleRoot = event.params.merkleRoot;
  distributor.merkleProofs = event.params.merkleProofs;
  distributor.updatedAtBlock = event.block.number;
  distributor.updatedAtTimestamp = event.block.timestamp;
  distributor.rewardsUpdatedAtBlock = rewardEthToken.updatedAtBlock;
  distributor.save();

  // reset the period rewards as merkle rewards were distributed
  rewardEthToken.distributorPeriodReward = BIG_DECIMAL_ZERO;
  rewardEthToken.protocolPeriodReward = BIG_DECIMAL_ZERO;
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

export function handleDistributionAdded(event: DistributionAdded): void {
  let distributionId = event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toString());

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
