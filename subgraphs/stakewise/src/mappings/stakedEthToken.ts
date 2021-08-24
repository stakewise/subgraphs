import { log } from "@graphprotocol/graph-ts";

import { createOrLoadSettings } from "../entities";
import {
  Paused,
  Unpaused,
} from "../../generated/StakedEthToken/StakedEthToken";

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
