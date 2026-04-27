import pkg from '@/package.json';

export const APP_VERSION = pkg.version;
export const BUILD_TIME = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev';
