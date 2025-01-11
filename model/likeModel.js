import { conn } from '../database/connect/maria.js';


// 좋아요 추가
export const addLike = async (postId) => {
  const query = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
  const values  = [userId, postId];
  const [result] = await m
}

// 좋아요 삭제

// 좋아요 상태 확인


// 좋아요 수 조회