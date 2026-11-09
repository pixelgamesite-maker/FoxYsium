import { lazy, Suspense } from "react";
import { Router as WouterRouter, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import { Shell } from "@/components/layout/Shell";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

const Genesis = lazy(() => import("@/pages/genesis"));
const FoxProfile = lazy(() => import("@/pages/fox"));
const Foundry = lazy(() => import("@/pages/foundry"));
const FoundryNew = lazy(() => import("@/pages/foundry-new"));
const FoundryToken = lazy(() => import("@/pages/foundry-token"));
const Swap = lazy(() => import("@/pages/swap"));
const Staking = lazy(() => import("@/pages/staking"));
const Locker = lazy(() => import("@/pages/locker"));
const Liquidity = lazy(() => import("@/pages/liquidity"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const Agents = lazy(() => import("@/pages/agents"));
const Console = lazy(() => import("@/pages/console"));
const Guide = lazy(() => import("@/pages/guide"));
const Docs = lazy(() => import("@/pages/docs"));
const Terms = lazy(() => import("@/pages/legal").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("@/pages/legal").then((m) => ({ default: m.Privacy })));

function Router() {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
    <Suspense
      fallback={
        <div className="py-24 grid place-items-center text-mist">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      }
    >
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/genesis" component={Genesis} />
        <Route path="/fox/:id" component={FoxProfile} />
        <Route path="/foundry" component={Foundry} />
        <Route path="/foundry/new" component={FoundryNew} />
        <Route path="/foundry/:id" component={FoundryToken} />
        <Route path="/swap" component={Swap} />
        <Route path="/staking" component={Staking} />
        <Route path="/locker" component={Locker} />
        <Route path="/liquidity" component={Liquidity} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/agents" component={Agents} />
        <Route path="/console" component={Console} />
        <Route path="/guide" component={Guide} />
        <Route path="/docs" component={Docs} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <TooltipProvider>
        <WouterRouter>
          <Shell>
            <Router />
          </Shell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </WalletProvider>
  );
}
