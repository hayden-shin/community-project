import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsFilePath = path.join(__dirname, '../data/posts.json');
const commentsFilePath = path.join(__dirname, '../data/comments.json');

// JSON 파일에서 데이터를 읽어오는 함수
export const readPostsFromFile = async () => {
  const data = await fs.readFileSync(postsFilePath, 'utf-8');
  return JSON.parse(data);
};

export const readCommentsFromFile = async () => {
  const data = await fs.readFileSync(commentsFilePath, 'utf-8');
  return JSON.parse(data);
};

// JSON 파일에 데이터를 쓰는 함수
export const writePostsToFile = async (posts) => {
  await fs.writeFileSync(
    postsFilePath,
    JSON.stringify(posts, null, 2),
    'utf-8'
  );
};

export const writeCommentsToFile = async (comments) => {
  await fs.writeFileSync(
    commentsFilePath,
    JSON.stringify(comments, null, 2),
    'utf-8'
  );
};
