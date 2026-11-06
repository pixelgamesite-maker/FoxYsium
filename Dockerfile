# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

# Railway passes service variables to the build only when they are declared as ARGs.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_CHAIN_ID
ARG VITE_CHAIN_NAME
ARG VITE_RPC_URL
ARG VITE_EXPLORER_URL
ARG VITE_GENESIS_ADDRESS
ARG VITE_FOX_TOKEN_ADDRESS
ARG VITE_STAKING_ADDRESS
ARG VITE_LOCKER_ADDRESS
ARG VITE_VAULT_REGISTRY_ADDRESS
ARG VITE_VAULT_IMPLEMENTATION_ADDRESS
ARG VITE_SWAP_URL
ARG VITE_X_URL
ARG VITE_TELEGRAM_URL

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- serve ----
FROM caddy:2-alpine
WORKDIR /app
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /app/dist
ENV PORT=8080
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
