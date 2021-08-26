import { Address } from "@graphprotocol/graph-ts";
import {
  STAKED_ETH_TOKEN_ADDRESS,
  REWARD_ETH_TOKEN_ADDRESS,
  STAKEWISE_TOKEN_ADDRESS,
} from "const";

export function isSupportedToken(token: Address): boolean {
  return (
    token.equals(STAKED_ETH_TOKEN_ADDRESS) ||
    token.equals(REWARD_ETH_TOKEN_ADDRESS) ||
    token.equals(STAKEWISE_TOKEN_ADDRESS)
  );
}
