export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it in .env (local) or as a GitHub Actions secret (CI).`);
  }
  return value;
}
