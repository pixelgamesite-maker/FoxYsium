import { createConfig, http, fallback } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

const env = import.meta.env;

// Kinetiq Elysium, an Arbitrum Orbit L2 settling to HyperEVM, HYPE for gas.
// NB: viem's built-in `elysiumTestnet` is an unrelated chain (id 1338), so we
// define ours explicitly. Testnet values are the defaults; set the VITE_* vars
// to the official mainnet values once Kinetiq publishes them.
export const elysium = defineChain({
  id: Number(env.VITE_CHAIN_ID || 99801),
  name: env.VITE_CHAIN_NAME || "Elysium Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: {
    default: { http: [env.VITE_RPC_URL || "https://testnet-rpc.elysium.kinetiq.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Elysium Explorer",
      url: env.VITE_EXPLORER_URL || "https://elysium.kinetiq.xyz/testnet-explorer",
    },
  },
  testnet: Number(env.VITE_CHAIN_ID || 99801) === 99801,
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
            name: "FoxYsium",
            description: "2,626 Genesis Foxes on Elysium",
            url: typeof window !== "undefined" ? window.location.origin : "https://foxysium.xyz",
            icons: [typeof window !== "undefined" ? `${window.location.origin}/fox-hero.png` : ""],
          },
        }),
      ]
    : []),
  coinbaseWallet({ appName: "FoxYsium" }),
];

export const wagmiConfig = createConfig({
  chains: [elysium],
  connectors,
  transports: {
    [elysium.id]: fallback([http(elysium.rpcUrls.default.http[0])]),
  },
});

export const hasWalletConnect = !!wcProjectId;

export function explorerTx(hash: string) {
  return `${elysium.blockExplorers.default.url}/tx/${hash}`;
}
export function explorerAddress(addr: string) {
  return `${elysium.blockExplorers.default.url}/address/${addr}`;
}

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
