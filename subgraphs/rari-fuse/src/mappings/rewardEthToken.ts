import { log } from "@graphprotocol/graph-ts";
import { createOrLoadRewardEthToken } from "stakewise/src/entities";
import { RewardsUpdated } from "../../generated/RewardEthTokenV2/RewardEthTokenV2";

export function handleRewardsUpdatedV2(event: RewardsUpdated): void {
  let rewardEthToken = createOrLoadRewardEthToken();
  rewardEthToken.updatedAtBlock = event.block.number;
  rewardEthToken.updatedAtTimestamp = event.block.timestamp;
  rewardEthToken.save();

  log.info("[RewardEthToken] RewardsUpdated V2 timestamp={}", [
    rewardEthToken.updatedAtTimestamp.toString(),
  ]);
}
