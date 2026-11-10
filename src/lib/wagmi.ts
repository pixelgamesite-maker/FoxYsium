import { createConfig, http, fallback } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

const env = import.meta.env;

// Robinhood Chain, an Arbitrum Orbit L2 with ETH for gas. Mainnet (4663) is
// the default; set VITE_CHAIN_ID=46630 and the testnet RPC/explorer to test.
const id = Number(env.VITE_CHAIN_ID || 4663);
const isTestnet = id === 46630;

export const robinhood = defineChain({
  id,
  name: env.VITE_CHAIN_NAME || (isTestnet ? "Robinhood Chain Testnet" : "Robinhood Chain"),
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [env.VITE_RPC_URL || (isTestnet ? "https://rpc.testnet.chain.robinhood.com" : "https://rpc.mainnet.chain.robinhood.com")],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: env.VITE_EXPLORER_URL || (isTestnet ? "https://explorer.testnet.chain.robinhood.com" : "https://robinhoodchain.blockscout.com"),
    },
  },
  testnet: isTestnet,
});

const wcProjectId: string | undefined = env.VITE_WALLETCONNECT_PROJECT_ID || undefined;

const connectors = [
  injected({ shimDisconnect: true }),
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
          metadata: {
            name: "FoxBank",
            description: "2,626 Genesis Foxes on Robinhood Chain",
            url: typeof window !== "undefined" ? window.location.origin : "https://foxbank.xyz",
            icons: [typeof window !== "undefined" ? `${window.location.origin}/art/touch-icon.png` : ""],
          },
        }),
      ]
    : []),
  coinbaseWallet({ appName: "FoxBank" }),
];

export const wagmiConfig = createConfig({
  chains: [robinhood],
  connectors,
  transports: {
    [robinhood.id]: fallback([http(robinhood.rpcUrls.default.http[0])]),
  },
});

export const hasWalletConnect = !!wcProjectId;

export function explorerTx(hash: string) {
  return `${robinhood.blockExplorers.default.url}/tx/${hash}`;
}
export function explorerAddress(addr: string) {
  return `${robinhood.blockExplorers.default.url}/address/${addr}`;
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
