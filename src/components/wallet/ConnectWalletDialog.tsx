import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/use-wallet";
import { elysium, hasWalletConnect } from "@/lib/wagmi";
import { Loader2, Wallet, QrCode, CircleDot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LABELS: Record<string, { name: string; hint: string }> = {
  injected: { name: "Browser wallet", hint: "MetaMask, Rabby, OKX, or your wallet app's browser" },
  walletConnect: { name: "WalletConnect", hint: "Scan a QR code or open a mobile wallet" },
  coinbaseWalletSDK: { name: "Coinbase Wallet", hint: "Extension or Coinbase Wallet app" },
};

export function ConnectWalletDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { connectors, connect, pendingConnectorId, isConnected, isWrongNetwork, switchToElysium, isSwitching } = useWallet();
  const { toast } = useToast();

  const unique = connectors.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const onPick = async (id: string) => {
    try {
      await connect(id);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't connect.";
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: /reject|denied/i.test(msg) ? "The request was rejected in your wallet." : msg.split("\n")[0],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sticker !rounded-[22px] bg-dusk-2 text-belly w-[calc(100%-32px)] max-w-md grid-cols-[minmax(0,1fr)] p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-semibold">
            {isConnected && isWrongNetwork ? "Switch to Elysium" : "Connect a wallet"}
          </DialogTitle>
          <DialogDescription className="text-mist text-[15px]">
            {isConnected && isWrongNetwork
              ? `FoxYsium runs on ${elysium.name}. Your wallet will ask to add or switch the network.`
              : "Connecting lets the site read your Foxes and balances. Nothing is signed until you choose to."}
          </DialogDescription>
        </DialogHeader>

        {isConnected && isWrongNetwork ? (
          <button className="btn btn-fur w-full mt-2" onClick={switchToElysium} disabled={isSwitching}>
            {isSwitching && <Loader2 className="h-4 w-4 animate-spin" />} Switch to {elysium.name}
          </button>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 mt-2">
            {unique.map((c) => {
              const meta = LABELS[c.type] ?? LABELS[c.id] ?? { name: c.name, hint: "" };
              const name = c.type === "injected" && c.name && c.name !== "Injected" ? c.name : meta.name;
              const Icon = c.type === "walletConnect" ? QrCode : Wallet;
              return (
                <button
                  key={c.uid}
                  onClick={() => onPick(c.id)}
                  disabled={!!pendingConnectorId}
                  className="flex items-center gap-4 p-3.5 text-left rounded-2xl border border-line bg-dusk hover:bg-dusk-3 transition-colors disabled:opacity-60"
                >
                  <span className="h-11 w-11 rounded-xl border border-line bg-fur grid place-items-center shrink-0 overflow-hidden">
                    {c.icon ? <img src={c.icon} alt="" className="h-7 w-7" /> : <Icon className="h-5 w-5 text-ink" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold">{name}</span>
                    <span className="block text-[14px] text-haze truncate">{meta.hint}</span>
                  </span>
                  {pendingConnectorId === c.id && <Loader2 className="h-5 w-5 animate-spin text-fur" />}
                </button>
              );
            })}
            {!hasWalletConnect && (
              <p className="text-[13px] text-haze">On mobile, open this site inside your wallet app's browser.</p>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-[14px] text-mist">
          <CircleDot className="h-4 w-4 text-mint" />
          {elysium.name} · chain {elysium.id} · gas paid in HYPE
        </div>
      </DialogContent>
    </Dialog>
  );
}
