import { BigInt, log } from "@graphprotocol/graph-ts";
import { BIG_INT_ZERO } from "const";
import { PoolCreated } from "../../generated/Factory/Factory";
import { Pool as PoolTemplate } from "../../generated/templates";
import { Pool } from "../../generated/schema";
import { isSupportedToken } from "../entities";

export function handlePoolCreated(event: PoolCreated): void {
  if (
    !(
      isSupportedToken(event.params.token0) ||
      isSupportedToken(event.params.token1)
    )
  ) {
    return;
  }

  let pool = new Pool(event.params.pool.toHexString());

  pool.token0 = event.params.token0;
  pool.token1 = event.params.token1;
  pool.feeTier = BigInt.fromI32(event.params.fee);
  pool.liquidity = BIG_INT_ZERO;
  pool.sqrtPrice = BIG_INT_ZERO;
  pool.feeGrowthGlobal0X128 = BIG_INT_ZERO;
  pool.feeGrowthGlobal1X128 = BIG_INT_ZERO;
  pool.volumeToken0 = BIG_INT_ZERO;
  pool.volumeToken1 = BIG_INT_ZERO;
  pool.save();

  // create the tracked contract based on the template
  PoolTemplate.create(event.params.pool);

  log.info("[Factory] PoolCreated pool={} token0={} token1={} fee={}", [
    pool.id,
    pool.token0.toHexString(),
    pool.token1.toHexString(),
    pool.feeTier.toString(),
  ]);
}
