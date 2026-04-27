# Changelog

All notable changes to Pooly Brain. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] — 2026-04-27

### Fixed
- **DB connection: "fetch failed"** — POSTGRES_URL pooler hostname was malformed. Pulled correct pooled URI directly from Neon API (`ep-mute-glitter-aem1k9dl-pooler.c-2.us-east-2.aws.neon.tech`).
- POSTGRES_PASSWORD was corrupted by faulty regex (`//neondb_owner:npg_xxx` instead of `npg_xxx`).
- All POSTGRES_* env vars rebuilt cleanly via Vercel CLI.

### Added
- Version display in NavBar.
- `/api/version` endpoint returning `{ version, buildTime }`.
- CHANGELOG.md.

### Verified
- Migration ran successfully against Neon DB. All 6 tables present: `users`, `agents`, `wallets`, `policies`, `transactions`, `vendor_config`.
- `@vercel/postgres` connection works from local + production.

## [0.2.0] — 2026-04-27

### Added
- Real Vercel Postgres (Neon) provisioned via Neon API.
- Real Vercel KV (Upstash) connected from existing store.
- Migration `001_initial.sql` ran against production DB.
- 7 POSTGRES_* + 5 KV_* env vars set in production.

### Changed
- **Removed Google OAuth.** Replaced with NextAuth Credentials provider — email-only sign-in for demo.
- Login page rebuilt: email input form, demo-appropriate.
- `lib/auth.ts` upserts user on first login, falls back to mock session if DB unavailable.

## [0.1.0] — 2026-04-27

### Added
- Initial Next.js 16 + TypeScript scaffold.
- 4 demo scenarios: KYA Onboarding, Wallet Farm, Policy Engine, Legacy Checkout.
- 20 API routes (agent, passkey, treasury, policy, execution, webhooks, settings).
- Mock fixtures: 500 wallets, 3 agents, 3 policies, 20 transactions.
- Tour engine with 17-step automated demo walk-through.
- Vendor config page (`/settings`) for Stripe, Rapyd, VGS, GoDaddy ANS, Cloudflare Bot Auth.
- Ruflo (ruvnet/ruflo) integration: `.mcp.json`, `.claude-flow/`, 30+ skills + hooks.
- Caveman skill (JuliusBrussee/caveman) at `.claude/skills/caveman/SKILL.md`.
- Database schema with 6 tables.
- WebAuthn passkey registration + transaction-binding auth.
- Stripe webhook handler for `v1.delegated_checkout.finalize_checkout`.
- Rapyd HMAC signing helper.
- VGS forward proxy wrapper (port 8443).
- Cloudflare Web Bot Auth Ed25519 signing + JWKS endpoint.
- Vercel deployment with USE_MOCK_DATA=true default.
