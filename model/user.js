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
    .execute('SELECT * FROM user WHERE nickname = ?', [username]) //
    .then((result) => result[0][0]);
}

export async function createUser(user) {
  const { email, password, nickname, profileImage } = user;
  return db
    .execute(
      'INSERT INTO user (email, password, nickname, profileImage) VALUES (?,?,?,?)',
      [email, password, nickname, profileImage]
    ) //
    .then((result) => result[0][0]);
}

export async function updateUsername(user) {
  const { nickname, id } = user;
  return db
    .execute('UPDATE user SET nickname = ? WHERE id = ?', [nickname, id]) //
    .then((result) => result[0][0]);
}

export async function updateUrl(user) {
  const { profileImage, id } = user;
  return db.execute('UPDATE user SET profileImage = ? WHERE id = ?', [
    profileImage,
    id,
  ]);
}
