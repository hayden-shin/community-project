import fs from 'fs';
import path from 'path';

const POST_FILE = path.join(process.cwd(), '../data/post.json');
const COMMENT_FILE = path.join(process.cwd(), '../data/comment.json');

// 댓글 생성
export const createComment = async (req, res) => {
  const { content } = req.body;
  const userId = req.session?.user?.id;
  const postId = parseInt(req.params.post_id, 10);

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ message: 'invalid post', data: null });
  }

  if (!content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  const { nickname, profileImage } = req.session?.user;

  try {
    // 댓글 작성
    const comments = JSON.parse(fs.readFileSync(COMMENT_FILE, 'utf-8'));
    const newComment = {
      id: comments.length + 1,
      postId,
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: userId,
        nickname,
        profileImage,
      },
    };
    comments.push(newComment);
    fs.writeFileSync(COMMENT_FILE, JSON.stringify(comments, null, 2));

    // 댓글수 +1
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == postId);
    post.commentCount += 1;
    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    res.status(201).json({
      message: 'comment create success',
      data: { comment: newComment },
    });
  } catch (error) {
    console.error('댓글 생성 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
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
        comment.content, 
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
  const { content } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!commentId || !content) {
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
      `UPDATE comment SET content = ?, updated_at = ? WHERE id = ?`,
      [content, new Date().toISOString(), commentId]
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
