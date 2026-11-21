/**
 * CE/NCOS deployed-database admission. Pure, side-effect-free and safe to test
 * without connecting to Neon, Supabase or reading secrets.
 * No shared in-memory PGlite fallback on an actual Vercel deployment.
 */
/** @param {NodeJS.ProcessEnv} env */
export function assertDatabaseConfiguredForDeployment(env) {
  const isVercel = env?.VERCEL === '1' ||
    ['production', 'preview', 'development'].includes(env?.VERCEL_ENV);
  if (isVercel && !(typeof env?.DATABASE_URL === 'string' && env.DATABASE_URL.trim())) {
    throw new Error('CE_DB_DEPLOYMENT_CONNECTION_REQUIRED');
  }
}
