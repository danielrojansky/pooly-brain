CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  google_id TEXT UNIQUE,
  passkey_credential_id TEXT,
  passkey_public_key TEXT,
  passkey_counter BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ans_uri TEXT NOT NULL UNIQUE,
  protocol TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  capability TEXT NOT NULL,
  provider TEXT NOT NULL,
  version TEXT NOT NULL,
  extension TEXT NOT NULL,
  fqdn TEXT NOT NULL,
  trust_badge_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rail TEXT NOT NULL,
  external_id TEXT,
  balance_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  max_per_tx_cents BIGINT NOT NULL,
  max_daily_cents BIGINT NOT NULL,
  merchant_allowlist JSONB NOT NULL,
  priority TEXT NOT NULL,
  config_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  wallet_id UUID REFERENCES wallets(id),
  policy_id UUID REFERENCES policies(id),
  merchant_url TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  rail_used TEXT NOT NULL,
  status TEXT NOT NULL,
  policy_decision JSONB NOT NULL,
  vgs_alias TEXT,
  passkey_assertion TEXT,
  challenge_payload TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor config (encrypted values stored per user)
CREATE TABLE vendor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_treasury_platform_id TEXT,
  rapyd_access_key TEXT,
  rapyd_secret_key TEXT,
  vgs_vault_id TEXT,
  vgs_username TEXT,
  vgs_password TEXT,
  vgs_environment TEXT DEFAULT 'sandbox',
  godaddy_ans_api_key TEXT,
  cf_bot_auth_kid TEXT,
  cf_bot_auth_private_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tx_agent ON transactions(agent_id, created_at DESC);
CREATE INDEX idx_wallet_user ON wallets(user_id);
