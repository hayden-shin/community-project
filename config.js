import dotenv from 'dotenv';
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value;
}

export const config = {
  session: {
    secretKey: required('SESSION_SECRET'),
    expiresInSec: required('SESSION_EXPIRES_SEC', 86400),
  },
  bcrypt: {
    saltRounds: required('BCRYPT_SALT_ROUNDS', 10),
  },
  url: {
    baseUrl: required('BASE_URL'),
    clientUrl: required('CLIENT_URL'),
  },
  host: {
    port: required('HOST_PORT', 3000),
  },
};
