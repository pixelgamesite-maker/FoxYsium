import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { elysium } from "@/lib/wagmi";

// Wallet sign-in to Supabase (Sign in with Ethereum, EIP-4361).
// Connecting a wallet is enough to read; signing in is only needed to write
// (allowlist, Foundry submissions, agent configs). RLS keys every write to the
// signed-in wallet — see public.current_wallet() in the migration.
export function useDenAuth() {
  const { address, connector } = useAccount();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const sessionWallet = walletFromSession(session);
  const isSignedIn = !!session && !!address && sessionWallet === address.toLowerCase();

  const signIn = useCallback(async () => {
    setError(null);
    if (!supabase) {
      setError("Supabase isn't configured yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return false;
    }
    if (!connector) {
      setError("Connect a wallet first.");
      return false;
    }
    setSigningIn(true);
    try {
      // Any EIP-1193 provider works: injected, WalletConnect, Coinbase.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = (await connector.getProvider()) as any;
      const { error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        wallet: provider,
        statement: "Sign in to FoxYsium. This proves you own this wallet and costs no gas.",
        options: { signInWithEthereum: { chainId: elysium.id } },
      });
      if (error) throw error;
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(/reject|denied/i.test(msg) ? "Signature request was rejected in your wallet." : msg);
      return false;
    } finally {
      setSigningIn(false);
    }
  }, [connector]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  return { session, isSignedIn, loading, signingIn, error, signIn, signOut };
}

function walletFromSession(s: Session | null): string | null {
  if (!s) return null;
  const meta = (s.user.user_metadata ?? {}) as Record<string, unknown>;
  const fromMeta = typeof meta.address === "string" ? meta.address : null;
  const sub = typeof meta.sub === "string" ? meta.sub : "";
  const fromSub = sub.startsWith("web3:") ? sub.split(":").pop() ?? null : null;
  const ident = s.user.identities?.find((i) => i.provider === "web3");
  const fromIdent = (ident?.identity_data?.address as string | undefined) ?? (ident?.id?.split(":").pop() || null);
  const w = fromMeta || fromSub || fromIdent;
  return w ? w.toLowerCase() : null;
}
