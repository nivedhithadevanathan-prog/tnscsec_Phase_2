import { config } from "dotenv";
config();

import { env } from "node:process";

const getEnvVariable = (
  key: string,
  options?: { defaultValue?: string }
): string => {
  const value = env[key];
  const defaultValue = options?.defaultValue;

  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  if (value) {
    return value;
  }

  return defaultValue ?? "";
};


export const DATABASE_URL = getEnvVariable("DATABASE_URL");
