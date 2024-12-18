import maria from 'mysql';

import dotenv from 'dotenv';
dotenv.config();

export const conn = mariadb.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
