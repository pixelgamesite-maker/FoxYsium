import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from "wagmi";
import { elysium } from "@/lib/wagmi";

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connectors, connectAsync, isPending, variables } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId: elysium.id, query: { enabled: !!address } });

  const isWrongNetwork = isConnected && connector ? chainId !== elysium.id : false;

  return {
    address: address ?? null,
    shortAddress: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null,
    isConnected,
    isConnecting: isConnecting || isPending,
    pendingConnectorId: isPending ? (variables?.connector as { id?: string } | undefined)?.id : undefined,
    connector,
    connectors,
    connect: (connectorId: string) => {
      const c = connectors.find((x) => x.id === connectorId);
      if (!c) return Promise.reject(new Error("Wallet not available"));
      return connectAsync({ connector: c, chainId: elysium.id });
    },
    disconnect,
    isWrongNetwork,
    isSwitching,
    switchToElysium: () => switchChain({ chainId: elysium.id }),
    hype: balance,
  };
}

export { WalletProvider } from "./WalletProvider";
