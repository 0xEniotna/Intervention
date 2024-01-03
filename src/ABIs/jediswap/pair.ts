import { Abi } from "starknet";

export const JEDI_PAIR_ABI = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt",
      },
      {
        name: "high",
        offset: 1,
        type: "felt",
      },
    ],
    name: "Uint256",
    size: 2,
    type: "struct",
  },
  {
    data: [
      {
        name: "from_",
        type: "felt",
      },
      {
        name: "to",
        type: "felt",
      },
      {
        name: "value",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Transfer",
    type: "event",
  },
  {
    data: [
      {
        name: "owner",
        type: "felt",
      },
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "value",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Approval",
    type: "event",
  },
  {
    data: [
      {
        name: "from_address",
        type: "felt",
      },
      {
        name: "to_address",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Transfer",
    type: "event",
  },
  {
    data: [
      {
        name: "owner",
        type: "felt",
      },
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Approval",
    type: "event",
  },
  {
    data: [
      {
        name: "sender",
        type: "felt",
      },
      {
        name: "amount0",
        type: "Uint256",
      },
      {
        name: "amount1",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Mint",
    type: "event",
  },
  {
    data: [
      {
        name: "sender",
        type: "felt",
      },
      {
        name: "amount0",
        type: "Uint256",
      },
      {
        name: "amount1",
        type: "Uint256",
      },
      {
        name: "to",
        type: "felt",
      },
    ],
    keys: [],
    name: "Burn",
    type: "event",
  },
  {
    data: [
      {
        name: "sender",
        type: "felt",
      },
      {
        name: "amount0In",
        type: "Uint256",
      },
      {
        name: "amount1In",
        type: "Uint256",
      },
      {
        name: "amount0Out",
        type: "Uint256",
      },
      {
        name: "amount1Out",
        type: "Uint256",
      },
      {
        name: "to",
        type: "felt",
      },
    ],
    keys: [],
    name: "Swap",
    type: "event",
  },
  {
    data: [
      {
        name: "reserve0",
        type: "Uint256",
      },
      {
        name: "reserve1",
        type: "Uint256",
      },
    ],
    keys: [],
    name: "Sync",
    type: "event",
  },
  {
    inputs: [
      {
        name: "token0",
        type: "felt",
      },
      {
        name: "token1",
        type: "felt",
      },
    ],
    name: "constructor",
    outputs: [],
    type: "constructor",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "name",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "symbol",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "totalSupply",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "decimals",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "owner",
        type: "felt",
      },
      {
        name: "spender",
        type: "felt",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "remaining",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [
      {
        name: "address",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [
      {
        name: "address",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_reserves",
    outputs: [
      {
        name: "reserve0",
        type: "Uint256",
      },
      {
        name: "reserve1",
        type: "Uint256",
      },
      {
        name: "block_timestamp_last",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price_0_cumulative_last",
    outputs: [
      {
        name: "res",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price_1_cumulative_last",
    outputs: [
      {
        name: "res",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "klast",
    outputs: [
      {
        name: "res",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "recipient",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "sender",
        type: "felt",
      },
      {
        name: "recipient",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "added_value",
        type: "Uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "subtracted_value",
        type: "Uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "to",
        type: "felt",
      },
    ],
    name: "mint",
    outputs: [
      {
        name: "liquidity",
        type: "Uint256",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "to",
        type: "felt",
      },
    ],
    name: "burn",
    outputs: [
      {
        name: "amount0",
        type: "Uint256",
      },
      {
        name: "amount1",
        type: "Uint256",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "amount0Out",
        type: "Uint256",
      },
      {
        name: "amount1Out",
        type: "Uint256",
      },
      {
        name: "to",
        type: "felt",
      },
      {
        name: "data_len",
        type: "felt",
      },
      {
        name: "data",
        type: "felt*",
      },
    ],
    name: "swap",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "to",
        type: "felt",
      },
    ],
    name: "skim",
    outputs: [],
    type: "function",
  },
  {
    inputs: [],
    name: "sync",
    outputs: [],
    type: "function",
  },
] as Abi;
