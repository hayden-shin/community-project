import { db } from '../db/database.js';
import { countLike } from './post.js';

export async function getByPostIdAndUserId(postId, userId) {
  return db
    .execute('SELECT * FROM likes WHERE postId = ? AND userId = ?', [
      postId,
      userId,
    ]) //
    .then((result) => result[0][0]);
}

export async function add(like) {
  const { postId, userId } = like;
  return db
    .execute('INSERT INTO likes (postId, userId) VALUES (?,?)', [
      postId,
      userId,
    ]) //
    .then((result) => result[0].insertId);
}

export async function remove(like) {
  const { id, postId } = like;
  return db
    .execute('DELETE FROM likes WHERE id = ?', [id]) //
    .then(() => countLike(postId, id));
}
