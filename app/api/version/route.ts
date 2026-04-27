import { APP_VERSION, BUILD_TIME } from '@/lib/version';

export async function GET() {
  return Response.json({
    ok: true,
    data: {
      version: APP_VERSION,
      build: BUILD_TIME,
      timestamp: new Date().toISOString(),
    },
  });
}
