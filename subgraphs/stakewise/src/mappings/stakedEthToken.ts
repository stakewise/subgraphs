import { log } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_1E18, BYTES_ZERO } from "const";
import {
  Paused,
  Transfer,
  Unpaused,
} from "../../generated/StakedEthToken/StakedEthToken";
import {
  createOrLoadSettings,
  createOrLoadStakedEthTokenHolder,
  updateRewardEthTokenHolderBalance,
} from "../entities";

export function handleTransfer(event: Transfer): void {
  let settings = createOrLoadSettings();
  let amount = event.params.value.divDecimal(BIG_DECIMAL_1E18);

  let fromId = event.params.from.toHexString();
  if (event.params.from.notEqual(BYTES_ZERO)) {
    let fromHolder = createOrLoadStakedEthTokenHolder(fromId);
    updateRewardEthTokenHolderBalance(
      fromHolder,
      settings.rewardPerStakedEthToken
    );
    fromHolder.balance = fromHolder.balance.minus(amount);
    fromHolder.save();
  }

  let toId = event.params.to.toHexString();
  if (event.params.to.notEqual(BYTES_ZERO)) {
    let toHolder = createOrLoadStakedEthTokenHolder(toId);
    updateRewardEthTokenHolderBalance(
      toHolder,
      settings.rewardPerStakedEthToken
    );

    toHolder.balance = toHolder.balance.plus(amount);
    toHolder.save();
  }

  log.info("[StakedEthToken] Transfer from={} to={} amount={}", [
    fromId,
    toId,
    amount.toString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.stakedEthTokenPaused = true;
  settings.save();

  log.info("[StakedEthToken] Paused account={}", [
    event.params.account.toHexString(),
  ]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.stakedEthTokenPaused = false;
  settings.save();

  log.info("[StakedEthToken] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
