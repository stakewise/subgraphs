import { dataSource } from "@graphprotocol/graph-ts";

import { BYTES_ZERO, BIG_INT_ZERO } from "const";
import { MerkleDistributor } from "../../generated/schema";

export function createOrLoadMerkleDistributor(): MerkleDistributor {
  let distributorAddress = dataSource.address().toHexString();
  let distributor = MerkleDistributor.load(distributorAddress);

  if (distributor == null) {
    distributor = new MerkleDistributor(distributorAddress);

    distributor.merkleRoot = BYTES_ZERO;
    distributor.merkleProofs = "";
    distributor.updatedAtBlock = BIG_INT_ZERO;
    distributor.updatedAtTimestamp = BIG_INT_ZERO;
    distributor.save();
  }
  return distributor as MerkleDistributor;
}
