import { conn } from '../database/connect/maria.js';

// 사용자 추가 (회원가입)
export const addUser = async (email, password, nickname, profileUrl) => {
  const query = `
    INSERT INTO users (email, password, nickname, profile_url, created_at) VALUES (?, ?, ?, ?, NOW())
  `;
  const [result] = await conn.execute(query, [
    email,
    password,
    nickname,
    profileUrl,
  ]);
  return result.insertId; // 새로 생성된 사용자의 ID 반환
};

// 이메일로 사용자 조회 (로그인)
export const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await conn.execute(query, [email]);
  return rows[0]; // 일치하는 첫 번째 사용자 반환
};

// 사용자 ID로 사용자 조회
export const getUserById = async (userId) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await conn.execute(query, [userId]);
  return rows[0];
};

// 사용자 정보 업데이트
export const updateUser = async (userId, email, nickname, profileUrl) => {
  const query = `
    UPDATE users
    SET email = ?, nickname = ?, profile_url = ?
    WHERE id = ?
  `;
  await conn.execute(query, [email, nickname, profileUrl, userId]);
};

// 비밀번호 업데이트
export const updatePassword = async (userId, password) => {
  const query = `
    UPDATE users SET password = ? WHERE id = ?
  `;
  conn.execute(query, [password, userId]);
};

// 사용자 삭제
export const deleteUser = async (userId) => {
  const query = `DELETE FROM users WHERE id = ?`;
  conn.execute(query, [userId]);
};
