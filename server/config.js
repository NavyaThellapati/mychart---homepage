function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[config] ${name} is required`);
  }
  return value;
}

function getJwtSecret() {
  const secret = requireEnvironmentVariable('JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('[config] JWT_SECRET must contain at least 32 characters');
  }
  return secret;
}

function getDatabaseUrl() {
  return requireEnvironmentVariable('DATABASE_URL');
}

function validateConfig() {
  getJwtSecret();
  getDatabaseUrl();
}

module.exports = {
  getDatabaseUrl,
  getJwtSecret,
  validateConfig,
};
