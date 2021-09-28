import { BIG_INT_ZERO } from "const";
import { Network } from "../../generated/schema";

export function createOrLoadNetwork(): Network {
  let network = Network.load("1");

  if (network == null) {
    network = new Network("1");

    network.poolPaused = false;
    network.poolValidatorsPaused = false;
    network.merkleDistributorPaused = false;
    network.vestingEscrowFactoryPaused = false;
    network.oraclesPaused = false;
    network.stakeWiseTokenPaused = false;
    network.stakedEthTokenPaused = false;
    network.rewardEthTokenPaused = false;
    network.rolesPaused = false;
    network.oraclesRewardsNonce = BIG_INT_ZERO;
    network.oraclesValidatorsNonce = BIG_INT_ZERO;
    network.save();
  }
  return network as Network;
}
