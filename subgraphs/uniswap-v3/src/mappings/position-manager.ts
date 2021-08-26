import { log } from "@graphprotocol/graph-ts";
import {
  Collect,
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { createOrLoadPosition } from "../entities";

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let position = createOrLoadPosition(event.params.tokenId);

  // position was not able to be fetched or is not supported
  if (position == null) {
    return;
  }

  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.save();

  log.info(
    "[NonfungiblePositionManager] IncreaseLiquidity position={} liquidity={}",
    [position.id, event.params.liquidity.toString()]
  );
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let position = createOrLoadPosition(event.params.tokenId);

  // position was not able to be fetched or is not supported
  if (position == null) {
    return;
  }

  position.liquidity = position.liquidity.minus(event.params.liquidity);
  position.save();

  log.info(
    "[NonfungiblePositionManager] DecreaseLiquidity position={} liquidity={}",
    [position.id, event.params.liquidity.toString()]
  );
}

export function handleCollect(event: Collect): void {
  // updates the fee growth as part of the load
  createOrLoadPosition(event.params.tokenId);

  log.info(
    "[NonfungiblePositionManager] Collect position={} amount0={} amount1={}",
    [
      event.params.tokenId.toString(),
      event.params.amount0.toString(),
      event.params.amount1.toString(),
    ]
  );
}

export function handleTransfer(event: Transfer): void {
  let position = createOrLoadPosition(event.params.tokenId);

  // position was not able to be fetched or is not supported
  if (position == null) {
    return;
  }

  position.owner = event.params.to;
  position.save();

  log.info("[NonfungiblePositionManager] Transfer position={} from={} to={}", [
    position.id,
    event.params.from.toHexString(),
    event.params.to.toHexString(),
  ]);
}
