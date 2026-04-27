/**
 * Forward a request through the VGS outbound proxy.
 * The proxy intercepts outbound requests and reveals VGS aliases to real values.
 */
export async function vgsForwardRequest(
  url: string,
  init: RequestInit
): Promise<Response> {
  const vaultId = process.env.VGS_VAULT_ID ?? '';
  const username = process.env.VGS_USERNAME ?? '';
  const password = process.env.VGS_PASSWORD ?? '';
  const env = process.env.VGS_ENVIRONMENT ?? 'sandbox';

  const proxyUrl = `https://${username}:${password}@${vaultId}.${env}.verygoodproxy.com:8443`;

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      'Proxy-Authorization': `Basic ${credentials}`,
      'X-VGS-Proxy': proxyUrl,
    },
  });
}
