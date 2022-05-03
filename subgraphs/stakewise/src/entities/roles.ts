import { Address, BigInt } from "@graphprotocol/graph-ts";
import { calculateDistributorPoints } from "./merkleDistributor";
import { Partner } from "../../generated/schema";
import { createOrLoadRewardEthToken } from "./rewardEthToken";

export function loadPartner(
  partnerAddress: Address,
  currentBlock: BigInt
): Partner | null {
  let partner = Partner.load(partnerAddress.toHexString());
  if (partner != null) {
    let rewardEthToken = createOrLoadRewardEthToken();
    partner.distributorPoints = calculateDistributorPoints(
      partner.revenueShare.times(partner.contributedAmount),
      partner.distributorPoints,
      partner.updatedAtBlock,
      rewardEthToken.updatedAtBlock,
      currentBlock
    );
  }
  return partner;
}
