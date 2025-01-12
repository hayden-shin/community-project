import { db } from '../db/database.js';

export async function findById(id) {
  return db
    .execute('SELECT * FROM user WHERE id = ?', [id]) //
    .then((result) => result[0][0]);
}

export async function findByEmail(email) {
  return db
    .execute('SELECT * FROM user WHERE email = ?', [email]) //
    .then((result) => result[0][0]);
}

export async function findByUsername(username) {
  return db
    .execute('SELECT * FROM user WHERE username = ?', [username]) //
    .then((result) => result[0][0]);
}

export async function createUser(user) {
  const { email, password, username, url } = user;
  return db
    .execute(
      'INSERT INTO user (email, password, username, url) VALUES (?,?,?,?)',
      [email, password, username, url]
    ) //
    .then((result) => result[0].insertId);
}

export async function updateUsername(username, id) {
  return db
    .execute('UPDATE user SET username = ? WHERE id = ?', [username, id]) //
    .then((result) => result[0][0]);
}

export async function updateUrl(url, id) {
  return db
    .execute('UPDATE user SET url = ? WHERE id = ?', [url, id]) //
    .then((result) => result[0][0]);
}

export async function updatePassword(password, id) {
  return db
    .execute('UPDATE user SET password = ? WHERE id = ?', [password, id]) //
    .then((result) => result[0][0]);
}

export async function deleteUser(id) {
  return db
    .execute('DELETE FROM user WHERE id = ?', [id]) //
    .then((result) => console.log(result[0][0]));
}
