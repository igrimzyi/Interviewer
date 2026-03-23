function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: getRequiredEnv("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    username: getRequiredEnv("DB_USER"),
    password: getRequiredEnv("DB_PASSWORD"),
    database: getRequiredEnv("DB_NAME"),
    logging: process.env.DB_LOGGING === "true",
  },
  auth: {
    saltRounds: Number(process.env.PASSWORD_SALT_ROUNDS ?? 10),
  },
};
