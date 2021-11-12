import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO } from "const";
import {
  calculateDistributorPoints,
  createOrLoadMerkleDistributor,
} from "./merkleDistributor";
import { Partner, Referrer } from "../../generated/schema";

export function loadPartner(
  partnerAddress: Address,
  currentBlock: BigInt
): Partner | null {
  let partner = Partner.load(partnerAddress.toHexString());
  if (partner != null) {
    let distributor = createOrLoadMerkleDistributor();
    partner.distributorPoints = calculateDistributorPoints(
      partner.revenueShare.times(partner.contributedAmount),
      partner.distributorPoints,
      partner.updatedAtBlock,
      distributor.rewardsUpdatedAtBlock,
      currentBlock
    );
  }
  return partner;
}

export function loadReferrer(
  referrerAddress: Address,
  block: ethereum.Block
): Referrer | null {
  let referrer = Referrer.load(referrerAddress.toHexString());
  if (referrer == null) {
    referrer = new Referrer(referrerAddress.toHexString());
    referrer.contributedAmount = BIG_INT_ZERO;
    referrer.updatedAtBlock = block.number;
    referrer.updatedAtTimestamp = block.timestamp;
    referrer.save();
  }
  return referrer;
}
