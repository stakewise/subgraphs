import { dataSource } from "@graphprotocol/graph-ts";

import { MerkleDistributor } from "../../generated/schema";
import { EMPTY_BYTES } from "../constants";

export function createOrLoadMerkleDistributor(): MerkleDistributor {
  let distributorAddress = dataSource.address().toHexString();
  let distributor = MerkleDistributor.load(distributorAddress);

  if (distributor == null) {
    distributor = new MerkleDistributor(distributorAddress);

    distributor.merkleRoot = EMPTY_BYTES;
    distributor.merkleProofs = "";
    distributor.updatedAtBlock = 0;
    distributor.updatedAtTimestamp = 0;
    distributor.save();
  }
  return distributor as MerkleDistributor;
}
