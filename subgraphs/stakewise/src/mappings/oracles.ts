import { log, store } from "@graphprotocol/graph-ts";

import { createOrLoadOracle, createOrLoadSettings } from "../entities";

import {
  OracleAdded,
  OracleRemoved,
  Paused,
  Unpaused,
} from "../../generated/Oracles/Oracles";
import { Oracle } from "../../generated/schema";

export function handleOracleAdded(event: OracleAdded): void {
  let oracle = createOrLoadOracle(event.params.oracle.toHexString());

  oracle.votesSource = event.params.votesSource;
  oracle.save();

  log.info("[Oracles] OracleAdded oracle={} votesSource={} sender={}", [
    oracle.id,
    event.params.votesSource,
    event.transaction.from.toHexString(),
  ]);
}

export function handleOracleRemoved(event: OracleRemoved): void {
  let oracleAddress = event.params.oracle.toHexString();
  let oracle = Oracle.load(oracleAddress);

  if (oracle != null) {
    store.remove("Oracle", oracleAddress);
  }

  log.info("[Oracles] OracleRemoved oracle={} sender={}", [
    oracleAddress,
    event.transaction.from.toHexString(),
  ]);
}

export function handlePaused(event: Paused): void {
  let settings = createOrLoadSettings();

  settings.oraclesPaused = true;
  settings.save();

  log.info("[Oracles] Paused account={}", [event.params.account.toHexString()]);
}

export function handleUnpaused(event: Unpaused): void {
  let settings = createOrLoadSettings();

  settings.oraclesPaused = false;
  settings.save();

  log.info("[Oracles] Unpaused account={}", [
    event.params.account.toHexString(),
  ]);
}
