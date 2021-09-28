import { BigInt, log } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO } from "const";
import {
  Burn,
  Flash,
  Initialize,
  Mint,
  Pool as PoolABI,
  Swap,
} from "../../generated/templates/Pool/Pool";
import { Pool } from "../../generated/schema";

export function handleInitialize(event: Initialize): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  pool.sqrtPrice = event.params.sqrtPriceX96;
  pool.tick = BigInt.fromI32(event.params.tick);
  pool.save();

  log.info("[Pool] Initialize pool={} sqrtPrice={} tick={}", [
    pool.id,
    pool.sqrtPrice.toString(),
    (pool.tick as BigInt).toString(),
  ]);
}

export function handleMint(event: Mint): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  let tickLower = BigInt.fromI32(event.params.tickLower);
  let tickUpper = BigInt.fromI32(event.params.tickUpper);
  if (
    pool.tick !== null &&
    tickLower.le(pool.tick as BigInt) &&
    tickUpper.gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.plus(event.params.amount);
    pool.save();
  }

  log.info("[Pool] Mint pool={} tickLower={} tickUpper={} amount={}", [
    pool.id,
    tickLower.toString(),
    tickUpper.toString(),
    event.params.amount.toString(),
  ]);
}

export function handleBurn(event: Burn): void {
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  if (pool == null) {
    return;
  }

  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on burn if the position being burnt includes the current tick.
  let tickLower = BigInt.fromI32(event.params.tickLower);
  let tickUpper = BigInt.fromI32(event.params.tickUpper);
  if (
    pool.tick !== null &&
    tickLower.le(pool.tick as BigInt) &&
    tickUpper.gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.minus(event.params.amount);
    pool.save();
  }

  log.info("[Pool] Burn pool={} tickLower={} tickUpper={} amount={}", [
    pool.id,
    tickLower.toString(),
    tickUpper.toString(),
    event.params.amount.toString(),
  ]);
}

export function handleSwap(event: Swap): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  // need absolute amounts for volume
  let amount0Abs = event.params.amount0;
  if (event.params.amount0.lt(BIG_INT_ZERO)) {
    amount0Abs = event.params.amount0.times(BigInt.fromString("-1"));
  }
  let amount1Abs = event.params.amount1;
  if (event.params.amount1.lt(BIG_INT_ZERO)) {
    amount1Abs = event.params.amount1.times(BigInt.fromString("-1"));
  }

  // pool volume
  pool.volumeToken0 = pool.volumeToken0.plus(amount0Abs);
  pool.volumeToken1 = pool.volumeToken1.plus(amount1Abs);

  // Update the pool with the new active liquidity, price, and tick.
  pool.liquidity = event.params.liquidity;
  pool.tick = BigInt.fromI32(event.params.tick);
  pool.sqrtPrice = event.params.sqrtPriceX96;

  // update fee growth
  let poolContract = PoolABI.bind(event.address);
  let feeGrowthGlobal0X128 = poolContract.feeGrowthGlobal0X128();
  let feeGrowthGlobal1X128 = poolContract.feeGrowthGlobal1X128();
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128;
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128;
  pool.save();

  log.info("[Pool] Swap pool={} amount0={} amount1={}", [
    pool.id,
    event.params.amount0.toString(),
    event.params.amount1.toString(),
  ]);
}

export function handleFlash(event: Flash): void {
  // update fee growth
  let pool = Pool.load(event.address.toHexString());
  if (pool == null) {
    return;
  }

  let poolContract = PoolABI.bind(event.address);
  let feeGrowthGlobal0X128 = poolContract.feeGrowthGlobal0X128();
  let feeGrowthGlobal1X128 = poolContract.feeGrowthGlobal1X128();
  pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128;
  pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128;
  pool.save();

  log.info("[Pool] Flash pool={} amount0={} amount1={}", [
    pool.id,
    event.params.amount0.toString(),
    event.params.amount1.toString(),
  ]);
}
