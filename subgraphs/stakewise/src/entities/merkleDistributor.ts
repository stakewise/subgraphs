import { Address, Bytes, dataSource, ethereum } from "@graphprotocol/graph-ts";

import {
  MerkleDistributor,
  MerkleDistributorClaim,
  TokenDistribution,
} from "../../generated/schema";
import { EMPTY_ADDRESS, EMPTY_BIG_DECIMAL, EMPTY_BYTES } from "../constants";

export function createOrLoadMerkleDistributor(): MerkleDistributor {
  let distributorAddress = dataSource.address().toHexString();
  let distributor = MerkleDistributor.load(distributorAddress);

  if (!distributor) {
    distributor = new MerkleDistributor(distributorAddress);

    distributor.merkleRoot = EMPTY_BYTES;
    distributor.merkleProofs = "";
    distributor.updatedAtBlock = 0;
    distributor.updatedAtTimestamp = 0;
    distributor.save();
  }
  return distributor as MerkleDistributor;
}

export function createTokenDistribution(
  transaction: ethereum.Transaction
): TokenDistribution {
  let distributionId = transaction.hash
    .toHexString()
    .concat("-")
    .concat(transaction.index.toString());

  let distribution = new TokenDistribution(distributionId);
  distribution.token = EMPTY_ADDRESS;
  distribution.beneficiary = EMPTY_ADDRESS;
  distribution.amount = EMPTY_BIG_DECIMAL;
  distribution.startedAtBlock = 0;
  distribution.startedAtTimestamp = 0;
  distribution.endedAtBlock = 0;
  distribution.save();

  return distribution as TokenDistribution;
}

export function createMerkleDistributorClaim(
  account: Address,
  merkleRoot: Bytes,
  merkleProofs: string
): MerkleDistributorClaim {
  let claimId = account
    .toHexString()
    .concat("-")
    .concat(merkleRoot.toHexString());

  let claim = new MerkleDistributorClaim(claimId);
  claim.merkleRoot = merkleRoot;
  claim.merkleProofs = merkleProofs;
  claim.save();

  return claim as MerkleDistributorClaim;
}
