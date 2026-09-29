import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME,
  CLIENT_ORIGIN,
} = process.env;

const requiredEnvVars = {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME,
  CLIENT_ORIGIN,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

let clientOrigins: string[];
try {
  clientOrigins = JSON.parse(CLIENT_ORIGIN as string);
} catch {
  throw new Error(
    'CLIENT_ORIGIN must be a JSON array of origins, e.g. ["http://localhost:5173"]',
  );
}

export const Config = {
  PORT,
  NODE_ENV,
  ...(requiredEnvVars as Record<keyof typeof requiredEnvVars, string>),
  CLIENT_ORIGIN: clientOrigins,
};
