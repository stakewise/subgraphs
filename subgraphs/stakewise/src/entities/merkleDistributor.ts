import { dataSource } from "@graphprotocol/graph-ts";

import { MerkleDistributor } from "../../generated/schema";
import { EMPTY_BYTES, EMPTY_BIG_INT } from "../constants";

export function createOrLoadMerkleDistributor(): MerkleDistributor {
  let distributorAddress = dataSource.address().toHexString();
  let distributor = MerkleDistributor.load(distributorAddress);

  if (distributor == null) {
    distributor = new MerkleDistributor(distributorAddress);

    distributor.merkleRoot = EMPTY_BYTES;
    distributor.merkleProofs = "";
    distributor.updatedAtBlock = EMPTY_BIG_INT;
    distributor.updatedAtTimestamp = EMPTY_BIG_INT;
    distributor.save();
  }
  return distributor as MerkleDistributor;
}
