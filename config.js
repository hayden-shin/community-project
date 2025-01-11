import dotenv from 'dotenv';
dotenv.config();

export const config = {
  session: {
    secretKey: process.env.SESSION_SECRET,
    expiresInSec: process.env.SESSION_EXPIRES_SEC,
  },
  bcrypt: {
    saltRounds: process.env.BCRYPT_SALT_ROUNDS,
  },
  url: {
    baseUrl: process.env.BASE_URL,
    clientUrl: process.env.CLIENT_URL,
  },
};
