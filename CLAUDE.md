# Pooly Brain — Claude Code Configuration

## Project

"The Financial Brain for Agentic Commerce" — investor demo MVP.
Repo: https://github.com/ruvnet/ruflo
Caveman skill: https://github.com/JuliusBrussee/caveman

## Behavioral Rules (Always Enforced)

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create docs (*.md) or README unless asked
- ALWAYS read file before editing
- NEVER commit secrets, credentials, or .env files
- NEVER save working files or tests to root folder

## File Organization

- `/app` — Next.js App Router pages + API routes
- `/lib` — shared utilities, API clients, policy engine, tour
- `/components` — React components
- `/migrations` — SQL migration files
- `/lib/mocks` — mock JSON fixtures (USE_MOCK_DATA=true)

## Tech Stack

- Next.js 16+ App Router, TypeScript
- NextAuth v5 (Google provider) — auth
- Tailwind CSS + shadcn/ui
- Framer Motion — tour cursor animation
- Vercel Postgres + Vercel KV
- Stripe + Rapyd + VGS + WebAuthn

## Build & Test

```bash
npm run dev      # dev server
npm run build    # production build (must produce 0 TS errors)
npm run lint     # eslint
```

Mock mode (default — no credentials needed):
```bash
USE_MOCK_DATA=true npm run dev
```

## Ruflo Agent Orchestration

Framework: https://github.com/ruvnet/ruflo (ruflo v3, @claude-flow/cli)

```bash
# Quick CLI
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8
npx @claude-flow/cli@latest memory search --query "payment patterns"
npx @claude-flow/cli@latest doctor --fix
```

Available MCP tools (via ToolSearch): memory_store, memory_search, swarm_init, agent_spawn, hooks_route.

### 3-Tier Model Routing

| Tier | Handler | Use |
|------|---------|-----|
| 1 | Edit tool direct | Simple transforms |
| 2 | Haiku | Low-complexity tasks |
| 3 | Sonnet/Opus | Architecture, security, complex reasoning |

## Caveman Mode

Skill: https://github.com/JuliusBrussee/caveman
Installed at `.claude/skills/caveman/SKILL.md`.

- Active by default (full intensity)
- Drop: articles, filler, pleasantries, hedging
- Switch: `/caveman lite|full|ultra`
- Off: "stop caveman" / "normal mode"
- Code/commits/PRs: always write normal

## Critical Implementation Notes

1. ANS URI format: `mcp://AgentID.Capability.Provider.vX.Y.Z.Extension` — NO `ans://` scheme
2. Stripe Treasury: max 3 FA/Connected Account — use Virtual Ledger (500 Postgres rows, 1 real FA)
3. VGS proxy: port **8443**, HTTP Basic Auth
4. WebAuthn tx-auth: fresh challenge per tx = `SHA-256(canonicalJSON({amountCents,recipient,currency,nonce,timestamp,agentId}))`
5. Rapyd signing order: `method.lower + urlPath + salt + timestamp + accessKey + secretKey + body`
6. JWKS: `/.well-known/http-message-signatures-directory` (not `/jwks.json`)
7. Stripe webhook event: `v1.delegated_checkout.finalize_checkout`
8. vendor_config GET: mask secrets to last 4 chars before sending to client

## Mock Mode Rules

- `USE_MOCK_DATA=true` → all API routes return `/lib/mocks/*.json`, skip outbound fetch
- DB writes still execute (audit log stays coherent)
- WebAuthn still real
- Only outbound API calls are mocked

## Security

- NEVER hardcode API keys or credentials
- NEVER commit .env files
- Validate all user input at system boundaries
- Sanitize file paths to prevent directory traversal
- vendor_config secrets masked in GET responses

## Concurrency

- All related operations MUST be concurrent in single message
- Batch all file reads/writes in one message
- Spawn all agents in one message via Agent tool with `run_in_background: true`
