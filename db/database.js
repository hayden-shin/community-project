import maria from 'mysql2';
import { config } from '../config.js';

const pool = maria.createPool({
  host: config.db.host,
  user: config.db.user,
  database: config.db.database,
  password: config.db.password,
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = pool.promise();
