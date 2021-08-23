import { dataSource } from "@graphprotocol/graph-ts";

import { OperatorsRevenueSharing } from "../../generated/schema";
import { EMPTY_BIG_DECIMAL } from "../constants";

export function createOrLoadOperatorsRevenueSharing(): OperatorsRevenueSharing {
  let operatorsRevenueSharingAddress = dataSource.address().toHexString();
  let operatorsRevenueSharing = OperatorsRevenueSharing.load(
    operatorsRevenueSharingAddress
  );

  if (operatorsRevenueSharing == null) {
    operatorsRevenueSharing = new OperatorsRevenueSharing(
      operatorsRevenueSharingAddress
    );

    operatorsRevenueSharing.totalPoints = EMPTY_BIG_DECIMAL;
    operatorsRevenueSharing.rewardPerPoint = EMPTY_BIG_DECIMAL;
    operatorsRevenueSharing.totalReward = EMPTY_BIG_DECIMAL;
    operatorsRevenueSharing.save();
  }
  return operatorsRevenueSharing as OperatorsRevenueSharing;
}
