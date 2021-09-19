import { log } from "@graphprotocol/graph-ts";
import { ADDRESS_ZERO, BIG_DECIMAL_1E18 } from "const";
import {
  Paused,
  Transfer,
  Unpaused,
} from "../../generated/StakedEthToken/StakedEthToken";
import {
  createOrLoadNetwork,
  createOrLoadPool,
  createOrLoadRewardEthToken,
  createOrLoadStaker,
} from "../entities";

export function handleTransfer(event: Transfer): void {
  let rewardEthToken = createOrLoadRewardEthToken();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromStaker = createOrLoadStaker(
      fromId,
      rewardEthToken.rewardPerStakedEthToken
    );
    fromStaker.principalBalance = fromStaker.principalBalance.minus(amount);
    fromStaker.save();
  } else {
    let pool = createOrLoadPool();
    pool.balance = pool.balance.plus(amount);
    pool.save();
  }

  let toId = event.params.to.toHexString();
  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toStaker = createOrLoadStaker(
      toId,
      rewardEthToken.rewardPerStakedEthToken
    );
    toStaker.principalBalance = toStaker.principalBalance.plus(amount);
    toStaker.save();
  }

  log.info("[StakedEthToken] Transfer from={} to={} amount={}", [
    fromId,
    toId,
    amount.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let network = createOrLoadNetwork();

  network.stakedEthTokenPaused = true;
  network.save();

  log.info("[StakedEthToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let network = createOrLoadNetwork();

  network.stakedEthTokenPaused = false;
  network.save();

  log.info("[StakedEthToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
