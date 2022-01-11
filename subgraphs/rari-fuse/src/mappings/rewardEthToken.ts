import { log } from "@graphprotocol/graph-ts";
import { RewardsUpdated } from "../../generated/RewardEthTokenV2/RewardEthTokenV2";
import { createOrLoadRewardEthToken } from "../entities/rewardEthToken";

export function handleRewardsUpdatedV2(event: RewardsUpdated): void {
  let rewardEthToken = createOrLoadRewardEthToken();
  rewardEthToken.updatedAtBlock = event.block.number;
  rewardEthToken.updatedAtTimestamp = event.block.timestamp;
  rewardEthToken.save();

  log.info("[RewardEthToken] RewardsUpdated V2 timestamp={}", [
    rewardEthToken.updatedAtTimestamp.toString(),
  ]);
}
