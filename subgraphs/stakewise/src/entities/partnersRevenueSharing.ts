import { PARTNERS_REVENUE_SHARING_ADDRESS, BIG_DECIMAL_ZERO } from "const";
import { PartnersRevenueSharing } from "../../generated/schema";

export function createOrLoadPartnersRevenueSharing(): PartnersRevenueSharing {
  let partnersRevenueSharingAddress =
    PARTNERS_REVENUE_SHARING_ADDRESS.toHexString();
  let partnersRevenueSharing = PartnersRevenueSharing.load(
    partnersRevenueSharingAddress
  );

  if (partnersRevenueSharing == null) {
    partnersRevenueSharing = new PartnersRevenueSharing(
      partnersRevenueSharingAddress
    );

    partnersRevenueSharing.totalPoints = BIG_DECIMAL_ZERO;
    partnersRevenueSharing.rewardPerPoint = BIG_DECIMAL_ZERO;
    partnersRevenueSharing.totalReward = BIG_DECIMAL_ZERO;
    partnersRevenueSharing.save();
  }
  return partnersRevenueSharing as PartnersRevenueSharing;
}
