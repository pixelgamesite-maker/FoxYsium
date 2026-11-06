import { erc20Abi, erc721Abi, isAddress, type Address } from "viem";

const env = import.meta.env;
const addr = (v: string | undefined): Address | null => (v && isAddress(v) ? (v as Address) : null);

// Leave any of these blank until the contract is deployed — every page checks
// for null and shows a "not live yet" state instead of erroring.
export const CONTRACTS = {
  genesis: addr(env.VITE_GENESIS_ADDRESS),
  fox: addr(env.VITE_FOX_TOKEN_ADDRESS),
  staking: addr(env.VITE_STAKING_ADDRESS),
  locker: addr(env.VITE_LOCKER_ADDRESS),
  vaultRegistry: addr(env.VITE_VAULT_REGISTRY_ADDRESS || "0x000000006551c19487814612e58FE06813775758"),
  vaultImplementation: addr(env.VITE_VAULT_IMPLEMENTATION_ADDRESS),
} as const;

// Block the OpenSea drop contract was deployed in — speeds up ownership lookups.
export const GENESIS_DEPLOY_BLOCK = BigInt(env.VITE_GENESIS_DEPLOY_BLOCK || 0);

export const VAULT_SALT = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

// ── Genesis — OpenSea drop contract (ERC-721 / ERC721A) ─────────────
export const genesisAbi = [
  ...erc721Abi,
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const foxTokenAbi = erc20Abi;

// ── FoxStaking — interface the staking contract must expose ─────────
export const stakingAbi = [
  { type: "function", name: "totalStaked", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "stakerCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "stakedOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "earned", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "unlockedOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "stake", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

// ── FoxLocker — trustless time-lock, no admin key ──────────────────
export const lockerAbi = [
  { type: "function", name: "totalLocked", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "locksOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "unlockAt", type: "uint64" },
          { name: "withdrawn", type: "bool" },
        ],
      },
    ],
  },
  { type: "function", name: "lock", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }, { name: "unlockAt", type: "uint64" }], outputs: [{ name: "id", type: "uint256" }] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
] as const;

// ── ERC-6551 registry (v0.3) ───────────────────────────────────────
export const registryAbi = [
  {
    type: "function",
    name: "account",
    stateMutability: "view",
    inputs: [
      { name: "implementation", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "chainId", type: "uint256" },
      { name: "tokenContract", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "createAccount",
    stateMutability: "nonpayable",
    inputs: [
      { name: "implementation", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "chainId", type: "uint256" },
      { name: "tokenContract", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ type: "address" }],
  },
] as const;
