import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, BYTES_ZERO, MERKLE_DISTRIBUTOR_ADDRESS } from "const";
import { MerkleDistributor, MerkleRootSnapshot } from "../../generated/schema";

export function createOrLoadMerkleDistributor(): MerkleDistributor {
  let distributorAddress = MERKLE_DISTRIBUTOR_ADDRESS.toHexString();
  let distributor = MerkleDistributor.load(distributorAddress);

  if (distributor == null) {
    distributor = new MerkleDistributor(distributorAddress);

    distributor.merkleRoot = BYTES_ZERO;
    distributor.merkleProofs = "";
    distributor.updatedAtBlock = BIG_INT_ZERO;
    distributor.updatedAtTimestamp = BIG_INT_ZERO;
    distributor.rewardsUpdatedAtBlock = BIG_INT_ZERO;
    distributor.save();
  }
  return distributor as MerkleDistributor;
}

export function createMerkleRootSnapshot(
  snapshotId: string,
  merkleRoot: Bytes,
  merkleProofs: string,
  rewardsUpdateAtBlock: BigInt,
  block: ethereum.Block
): void {
  let snapshot = new MerkleRootSnapshot(snapshotId);

  snapshot.merkleRoot = merkleRoot;
  snapshot.merkleProofs = merkleProofs;
  snapshot.rewardsUpdateAtBlock = rewardsUpdateAtBlock;
  snapshot.createdAtBlock = block.number;
  snapshot.createdAtTimestamp = block.timestamp;
  snapshot.save();
}

export function calculateDistributorPoints(
  principal: BigInt,
  prevDistributorPoints: BigInt,
  updatedAtBlock: BigInt,
  rewardsUpdatedAtBlock: BigInt,
  currentBlock: BigInt
): BigInt {
  if (rewardsUpdatedAtBlock.ge(updatedAtBlock)) {
    return principal.times(currentBlock.minus(rewardsUpdatedAtBlock));
  }

  return prevDistributorPoints.plus(
    principal.times(currentBlock.minus(updatedAtBlock))
  );
}
