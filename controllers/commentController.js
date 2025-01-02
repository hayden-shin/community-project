import fs from 'fs';
import path from 'path';

const POST_FILE = path.join(process.cwd(), '../data/post.json');
const COMMENT_FILE = path.join(process.cwd(), '../data/comment.json');

// 댓글 생성
export const createComment = async (req, res) => {
  const { text } = req.body;
  const userId = req.session?.user?.id;

  const postId = parseInt(req.params.post_id, 10);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!postId || isNaN(postId)) {
    res.status(400).json({ message: 'Invalid post ID', data: null });
  }

  if (!text) {
    return res.status(400).json({ message: 'Invalid request', data: null });
  }

  try {
    // 댓글 작성
    await pool.query(
      `INSERT INTO comment (text, post_id, author_id) VALUES (?, ?, ?)`,
      [text, postId, userId]
    );

    // 댓글수 +1
    const [result] = await pool.query(
      `UPDATE post SET comments = comments + 1 WHERE id = ?`,
      [postId]
    );

    res
      .status(201)
      .json({ message: 'Comment created successful', data: result.insertId });
  } catch (error) {
    console.error('댓글 생성 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 특정 게시글의 댓글 가져오기
export const getCommentsByPostId = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    // const [comments] = await pool.query(
    //   `SELECT * FROM comment WHERE post_id = ?`,
    //   [postId]
    // );
    const [comments] = await pool.query(
      `
      SELECT 
        comment.id AS comment_id, 
        comment.text, 
        comment.created_at, 
        user.nickname AS author_nickname, 
        user.profile_url AS author_profile_url
      FROM comment
      JOIN user ON comment.author_id = user.id
      WHERE comment.post_id = ?
      ORDER BY comment.created_at ASC
      `,
      [postId]
    );

    res.status(200).json({ message: 'Comments retrieved', data: comments });
  } catch (error) {
    console.error('댓글 가져오기 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const { text } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!commentId || !text) {
    return res.status(400).json({ message: 'Invalid request', data: null });
  }

  try {
    const [comments] = await pool.query(`SELECT * FROM comment WHERE id = ?`, [
      commentId,
    ]);

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found', data: null });
    }

    const comment = comments[0];
    if (comment.author_id !== userId) {
      return res.status(403).json({ message: 'No permission', data: null });
    }

    await pool.query(
      `UPDATE comment SET text = ?, updated_at = ? WHERE id = ?`,
      [text, new Date().toISOString(), commentId]
    );

    res
      .status(200)
      .json({ message: 'Comment updated successfully', data: null });
  } catch (error) {
    console.error('댓글 수정 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!commentId) {
    return res.status(400).json({ message: 'Invalid request', data: null });
  }

  try {
    const [comments] = await pool.query(`SELECT * FROM comment WHERE id = ?`, [
      commentId,
    ]);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found', data: null });
    }

    const comment = comments[0];
    if (comment.author_id !== userId) {
      return res.status(403).json({ message: 'No permission', data: null });
    }

    // 댓글 삭제
    await pool.query(`DELETE FROM comment WHERE id = ?`, [commentId]);

    // 게시글 댓글수 -1
    await pool.query(`UPDATE post SET comments = comments - 1 WHERE id = ?`, [
      comment.post_id,
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('댓글 삭제 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
