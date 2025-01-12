import { db } from '../db/database.js';

const POSTS_SELECT_JOIN = `
  SELECT p.id, p.title, p.content, COALESCE(p.updatedAt, p.createdAt) AS createdAt, p.userId, u.username, u.url 
  FROM post as p 
  JOIN user as u ON p.userId = u.id
  `;

const POST_SELECT_JOIN = `
  SELECT p.id, p.title, p.content, p.imageUrl, p.likeCount, p.viewCount, p.commentCount, p.createdAt, p.updatedAt, p.userId, u.username, u.url
  FROM post AS p
  JOIN user AS u ON p.userId = u.id
`;
const ORDER_DESC = 'ORDER BY p.createdAt DESC';

export async function getAll() {
  return db
    .execute(`${POSTS_SELECT_JOIN} ${ORDER_DESC}`) //
    .then((result) => result[0]);
}

export async function getById(id) {
  return db
    .execute(`${POST_SELECT_JOIN} WHERE p.id = ?`, [id]) //
    .then((result) => result[0][0]);
}

export async function view(id) {
  return db
    .execute('UPDATE post SET viewCount = viewCount + 1 WHERE id = ?', [id]) //
    .then((result) => result[0][0]);
}

export async function create(post) {
  const { title, content, imageUrl = null, userId } = post;
  return db
    .execute(
      'INSERT INTO post (title, content, imageUrl, userId) VALUES (?,?,?,?)',
      [title, content, imageUrl, userId]
    ) //
    .then((result) => getById(result[0].insertId));
}

export async function update(title, content, imageUrl = null, id) {
  return db
    .execute(
      'UPDATE post SET title = ?, content = ?, imageUrl = ? WHERE id = ?',
      [title, content, imageUrl, id]
    ) //
    .then(() => getById(id));
}

export async function remove(id) {
  return db.execute('DELETE FROM post WHERE id = ?', [id]);
}
