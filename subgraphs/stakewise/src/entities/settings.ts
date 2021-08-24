import { Settings } from "../../generated/schema";
import { EMPTY_BIG_INT } from "../constants";

export function createOrLoadSettings(): Settings {
  let settings = Settings.load("1");

  if (settings == null) {
    settings = new Settings("1");

    settings.poolPaused = false;
    settings.poolValidatorsPaused = false;
    settings.merkleDistributorPaused = false;
    settings.vestingEscrowFactoryPaused = false;
    settings.operatorsRevenueSharingPaused = false;
    settings.partnersRevenueSharingPaused = false;
    settings.oraclesPaused = false;
    settings.stakeWiseTokenPaused = false;
    settings.stakedEthTokenPaused = false;
    settings.rewardEthTokenPaused = false;
    settings.rewardsUpdatedAtTimestamp = EMPTY_BIG_INT;
    settings.save();
  }
  return settings as Settings;
}
