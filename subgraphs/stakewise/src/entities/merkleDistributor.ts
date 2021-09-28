import { BigInt } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO, BYTES_ZERO, MERKLE_DISTRIBUTOR_ADDRESS } from "const";
import { MerkleDistributor } from "../../generated/schema";

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
