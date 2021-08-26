import { dataSource } from "@graphprotocol/graph-ts";

import { BIG_DECIMAL_ZERO } from "const";
import { OperatorsRevenueSharing } from "../../generated/schema";

export function createOrLoadOperatorsRevenueSharing(): OperatorsRevenueSharing {
  let operatorsRevenueSharingAddress = dataSource.address().toHexString();
  let operatorsRevenueSharing = OperatorsRevenueSharing.load(
    operatorsRevenueSharingAddress
  );

  if (operatorsRevenueSharing == null) {
    operatorsRevenueSharing = new OperatorsRevenueSharing(
      operatorsRevenueSharingAddress
    );

    operatorsRevenueSharing.totalPoints = BIG_DECIMAL_ZERO;
    operatorsRevenueSharing.rewardPerPoint = BIG_DECIMAL_ZERO;
    operatorsRevenueSharing.totalReward = BIG_DECIMAL_ZERO;
    operatorsRevenueSharing.save();
  }
  return operatorsRevenueSharing as OperatorsRevenueSharing;
}
