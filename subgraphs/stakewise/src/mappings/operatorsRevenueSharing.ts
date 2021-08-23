import { log, store } from "@graphprotocol/graph-ts";
import {
  AccountAdded,
  AccountRemoved,
  AmountIncreased,
  RevenueShareUpdated,
  RewardCollected,
  RewardsUpdated,
  Paused,
  Unpaused,
} from "../../generated/OperatorsRevenueSharing/RevenueSharing";
import { OperatorRevenueSharingAccount } from "../../generated/schema";
import {
  createOrLoadOperatorsRevenueSharing,
  createOrLoadSettings,
} from "../entities";
import {
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E22,
  BIG_DECIMAL_1E4,
  EMPTY_BIG_DECIMAL,
} from "../constants";

export function handleRewardsUpdated(event: RewardsUpdated): void {
  let revenueSharing = createOrLoadOperatorsRevenueSharing();
  let periodReward = event.params.periodReward.divDecimal(BIG_DECIMAL_1E18);

  revenueSharing.rewardPerPoint =
    event.params.rewardPerPoint.divDecimal(BIG_DECIMAL_1E22);
  revenueSharing.totalReward = revenueSharing.totalReward.plus(periodReward);
  revenueSharing.save();

  log.info(
    "[OperatorsRevenueSharing] RewardsUpdated sender={} periodReward={} rewardPerPoint={}",
    [
      event.params.sender.toHexString(),
      periodReward.toString(),
      revenueSharing.rewardPerPoint.toString(),
    ]
  );
}

export function handleAccountAdded(event: AccountAdded): void {
  let revenueSharing = createOrLoadOperatorsRevenueSharing();
  let account = new OperatorRevenueSharingAccount(
    event.params.beneficiary.toHexString()
  );

  account.amount = EMPTY_BIG_DECIMAL;
  account.rewardPerPoint = revenueSharing.rewardPerPoint;
  account.unclaimedReward = EMPTY_BIG_DECIMAL;
  account.contract = revenueSharing.id;
  account.revenueShare = event.params.revenueShare.divDecimal(BIG_DECIMAL_1E4);
  account.save();

  log.info(
    "[OperatorsRevenueSharing] AccountAdded sender={} beneficiary={} revenueShare={}",
    [
      event.transaction.from.toHexString(),
      account.id,
      account.revenueShare.toString(),
    ]
  );
}

export function handleAccountRemoved(event: AccountRemoved): void {
  let revenueSharing = createOrLoadOperatorsRevenueSharing();

  let account = OperatorRevenueSharingAccount.load(
    event.params.beneficiary.toHexString()
  );
  let reward = event.params.reward.divDecimal(BIG_DECIMAL_1E18);

  if (account != null) {
    let points = account.amount.times(account.revenueShare);
    revenueSharing.totalPoints = revenueSharing.totalPoints.minus(points);
    revenueSharing.totalReward = revenueSharing.totalReward.minus(reward);
    revenueSharing.save();
    store.remove("OperatorRevenueSharingAccount", account.id);
  }

  log.info(
    "[OperatorsRevenueSharing] AccountRemoved sender={} beneficiary={} reward={}",
    [
      event.transaction.from.toHexString(),
      event.params.beneficiary.toHexString(),
      reward.toString(),
    ]
  );
}

export function handleAmountIncreased(event: AmountIncreased): void {
  let account = OperatorRevenueSharingAccount.load(
    event.params.beneficiary.toHexString()
  );
  if (account == null) {
    return;
  }

  let addedAmount = event.params.amount.divDecimal(BIG_DECIMAL_1E18);
  let prevPoints = account.amount.times(account.revenueShare);
  let newPoints = account.amount.plus(addedAmount).times(account.revenueShare);

  let revenueSharing = createOrLoadOperatorsRevenueSharing();
  revenueSharing.totalPoints = revenueSharing.totalPoints
    .minus(prevPoints)
    .plus(newPoints);
  revenueSharing.save();

  let reward = event.params.reward.divDecimal(BIG_DECIMAL_1E18);
  account.amount = account.amount.plus(addedAmount);
  account.rewardPerPoint = revenueSharing.rewardPerPoint;
  account.unclaimedReward = reward;
  account.save();

  log.info(
    "[OperatorsRevenueSharing] AmountIncreased sender={} beneficiary={} unclaimedReward={} addedAmount={}",
    [
      event.transaction.from.toHexString(),
      event.params.beneficiary.toHexString(),
      reward.toString(),
      addedAmount.toString(),
    ]
  );
}

export function handleRevenueShareUpdated(event: RevenueShareUpdated): void {
  let account = OperatorRevenueSharingAccount.load(
    event.params.beneficiary.toHexString()
  );
  if (account == null) {
    return;
  }

  let prevRevenueShare = account.revenueShare;
  let newRevenueShare = event.params.revenueShare.divDecimal(BIG_DECIMAL_1E4);

  let revenueSharing = createOrLoadOperatorsRevenueSharing();
  revenueSharing.totalPoints = revenueSharing.totalPoints
    .minus(account.amount.times(prevRevenueShare))
    .plus(account.amount.times(newRevenueShare));
  revenueSharing.save();

  let reward = event.params.reward.divDecimal(BIG_DECIMAL_1E18);
  account.revenueShare = newRevenueShare;
  account.unclaimedReward = reward;
  account.rewardPerPoint = revenueSharing.rewardPerPoint;
  account.save();

  log.info(
    "[OperatorsRevenueSharing] RevenueShareUpdated sender={} beneficiary={} unclaimedReward={} revenueShare={}",
    [
      event.transaction.from.toHexString(),
      event.params.beneficiary.toHexString(),
      reward.toString(),
      account.revenueShare.toString(),
    ]
  );
}

export function handleRewardCollected(event: RewardCollected): void {
  let account = OperatorRevenueSharingAccount.load(
    event.params.beneficiary.toHexString()
  );
  if (account == null) {
    return;
  }

  let revenueSharing = createOrLoadOperatorsRevenueSharing();
  account.unclaimedReward = EMPTY_BIG_DECIMAL;
  account.rewardPerPoint = revenueSharing.rewardPerPoint;
  account.save();

  log.info(
    "[OperatorsRevenueSharing] RewardCollected sender={} beneficiary={} unclaimedReward={}",
    [
      event.params.sender.toHexString(),
      event.params.beneficiary.toHexString(),
      event.params.reward.divDecimal(BIG_DECIMAL_1E18).toString(),
    ]
  );
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.operatorsRevenueSharingPaused = true;
  settings.save();

  log.info("[OperatorsRevenueSharing] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.operatorsRevenueSharingPaused = false;
  settings.save();

  log.info("[OperatorsRevenueSharing] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
