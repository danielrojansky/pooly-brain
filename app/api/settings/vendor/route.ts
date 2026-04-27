import { auth } from '@/lib/auth';
import { MOCK } from '@/lib/mode';

function maskSecrets(row: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...row };
  const secretFields = [
    'stripe_secret_key', 'stripe_webhook_secret', 'rapyd_access_key',
    'rapyd_secret_key', 'vgs_password', 'godaddy_ans_api_key',
    'cf_bot_auth_private_key',
  ];
  for (const field of secretFields) {
    if (masked[field] && typeof masked[field] === 'string') {
      const val = masked[field] as string;
      masked[field] = val.length > 4 ? '••••' + val.slice(-4) : '••••';
    }
  }
  return masked;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  if (MOCK) {
    return Response.json({ ok: true, data: null });
  }

  try {
    const { db } = await import('@/lib/db');
    const rows = await db`
      SELECT * FROM vendor_config WHERE user_id = (SELECT id FROM users WHERE email = ${session.user.email})
    `;
    if (!rows.rows[0]) return Response.json({ ok: true, data: null });
    return Response.json({ ok: true, data: maskSecrets(rows.rows[0]) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const body = await req.json();

  if (MOCK) {
    return Response.json({ ok: true });
  }

  try {
    const { db } = await import('@/lib/db');
    await db`
      INSERT INTO vendor_config (
        user_id, stripe_secret_key, stripe_webhook_secret, stripe_treasury_platform_id,
        rapyd_access_key, rapyd_secret_key, vgs_vault_id, vgs_username, vgs_password, vgs_environment,
        godaddy_ans_api_key, cf_bot_auth_kid, cf_bot_auth_private_key, updated_at
      )
      VALUES (
        (SELECT id FROM users WHERE email = ${session.user.email}),
        ${body.stripeSecretKey ?? null}, ${body.stripeWebhookSecret ?? null}, ${body.stripeTreasuryPlatformId ?? null},
        ${body.rapydAccessKey ?? null}, ${body.rapydSecretKey ?? null},
        ${body.vgsVaultId ?? null}, ${body.vgsUsername ?? null}, ${body.vgsPassword ?? null}, ${body.vgsEnvironment ?? 'sandbox'},
        ${body.godaddyAnsApiKey ?? null}, ${body.cfBotAuthKid ?? null}, ${body.cfBotAuthPrivateKey ?? null}, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_secret_key = EXCLUDED.stripe_secret_key,
        stripe_webhook_secret = EXCLUDED.stripe_webhook_secret,
        stripe_treasury_platform_id = EXCLUDED.stripe_treasury_platform_id,
        rapyd_access_key = EXCLUDED.rapyd_access_key,
        rapyd_secret_key = EXCLUDED.rapyd_secret_key,
        vgs_vault_id = EXCLUDED.vgs_vault_id,
        vgs_username = EXCLUDED.vgs_username,
        vgs_password = EXCLUDED.vgs_password,
        vgs_environment = EXCLUDED.vgs_environment,
        godaddy_ans_api_key = EXCLUDED.godaddy_ans_api_key,
        cf_bot_auth_kid = EXCLUDED.cf_bot_auth_kid,
        cf_bot_auth_private_key = EXCLUDED.cf_bot_auth_private_key,
        updated_at = NOW()
    `;
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ ok: false, error: { code: 'DB_ERROR', message: msg } }, { status: 500 });
  }
}
