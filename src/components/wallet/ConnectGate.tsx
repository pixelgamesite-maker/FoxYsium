import React, { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useDenAuth } from "@/hooks/use-den-auth";
import { ConnectWalletDialog } from "./ConnectWalletDialog";
import { Loader2, PenLine, Wallet } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Renders children only once the visitor has connected (and, if `signIn`,
 * signed in with their wallet). Otherwise shows the next step to take.
 */
export function ConnectGate({
  children,
  signIn = false,
  why,
}: {
  children: React.ReactNode;
  signIn?: boolean;
  why: string;
}) {
  const { isConnected } = useWallet();
  const auth = useDenAuth();
  const [open, setOpen] = useState(false);

  if (!isConnected)
    return (
      <div className="sticker p-6 text-center">
        <Wallet className="h-8 w-8 mx-auto text-fur" />
        <div className="mt-3 font-semibold text-lg">Connect a wallet {why}</div>
        <button className="btn btn-fur mt-5" onClick={() => setOpen(true)}>
          Connect wallet
        </button>
        <ConnectWalletDialog open={open} onOpenChange={setOpen} />
      </div>
    );

  if (signIn && !auth.isSignedIn)
    return (
      <div className="sticker p-6 text-center">
        <PenLine className="h-8 w-8 mx-auto text-fur" />
        <div className="mt-3 font-semibold text-lg">Sign in {why}</div>
        <p className="text-mist mt-2 max-w-[44ch] mx-auto">
          Your wallet will ask you to sign a message. It proves the wallet is yours and costs no gas.
        </p>
        {!isSupabaseConfigured && (
          <p className="text-rose mt-3 text-[14px]">Supabase env vars aren't set on this deployment, so sign-in is off.</p>
        )}
        {auth.error && <p className="text-rose mt-3 text-[14px]">{auth.error}</p>}
        <button className="btn btn-fur mt-5" onClick={auth.signIn} disabled={auth.signingIn || !isSupabaseConfigured}>
          {auth.signingIn && <Loader2 className="h-4 w-4 animate-spin" />} Sign message
        </button>
      </div>
    );

  return <>{children}</>;
}
