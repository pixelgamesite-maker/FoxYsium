import { Component, type ReactNode } from "react";

/**
 * Keeps one broken page from blanking the whole site. A failed lazy chunk
 * (usually an old tab open across a redeploy) reloads once automatically.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    const chunk = /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError/i.test(error.message);
    if (chunk) {
      try {
        if (!sessionStorage.getItem("fx-reloaded")) {
          sessionStorage.setItem("fx-reloaded", "1");
          window.location.reload();
        }
      } catch {
        /* storage blocked: fall through to the message */
      }
    }
    console.error(error);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="py-20 max-w-lg">
        <h1 className="text-3xl font-semibold">This page didn't load</h1>
        <p className="text-mist mt-3">Something went wrong while opening it. Reloading usually fixes it.</p>
        <button className="btn btn-fur mt-6" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}
