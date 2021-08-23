import { dataSource } from "@graphprotocol/graph-ts";

import { PartnersRevenueSharing } from "../../generated/schema";
import { EMPTY_BIG_DECIMAL } from "../constants";

export function createOrLoadPartnersRevenueSharing(): PartnersRevenueSharing {
  let partnersRevenueSharingAddress = dataSource.address().toHexString();
  let partnersRevenueSharing = PartnersRevenueSharing.load(
    partnersRevenueSharingAddress
  );

  if (partnersRevenueSharing == null) {
    partnersRevenueSharing = new PartnersRevenueSharing(
      partnersRevenueSharingAddress
    );

    partnersRevenueSharing.totalPoints = EMPTY_BIG_DECIMAL;
    partnersRevenueSharing.rewardPerPoint = EMPTY_BIG_DECIMAL;
    partnersRevenueSharing.totalReward = EMPTY_BIG_DECIMAL;
    partnersRevenueSharing.save();
  }
  return partnersRevenueSharing as PartnersRevenueSharing;
}
