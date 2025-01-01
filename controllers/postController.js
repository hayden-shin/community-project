import { pool } from '../database/connect/maria.js';

// 새 게시글 생성
export const createPost = async (req, res) => {
  const { title, text } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!title || !text) {
    return res.status(400).json({ message: 'Invalid request', data: null });
  }

  try {
    let imageUrl = req.file ? `/assets/${req.file.filename}` : null;

    const [post] = await pool.query(
      `INSERT INTO post (title, text, image_url, author_id) VALUES (?, ?, ?, ?)`,
      [title, text, imageUrl, userId]
    );

    return res.status(201).json({
      message: 'Post create success',
      data: { postId: post.insertId },
    });
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', data: null });
  }
};

// 특정 게시글 가져오기
export const getPostById = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const [posts] = await pool.query(`SELECT * FROM post WHERE id = ?`, [
      postId,
    ]);

    const post = posts[0];

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found', data: null });
    }

    // 게시글의 댓글 로드
    const [comments] = await pool.query(
      `SELECT * FROM comment WHERE post_id = ?`,
      [postId]
    );

    // 조회수 증가
    await pool.query(`UPDATE post SET views = views+ 1 WHERE id = ?`, [postId]);

    console.log('Returning data:', { post, comments });
    res.status(200).json({
      message: 'Post retrieved',
      data: { post, comments },
    });
  } catch (error) {
    console.error('게시글 가져오기 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 게시글 수정
export const editPost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  const { title, text } = req.body;
  const imageUrl = req.file ? `/assets/${req.file.filename}` : null;

  try {
    // 수정할 게시글 찾기
    const [posts] = await pool.query(`SELECT * FROM post WHERE id = ?`, [
      postId,
    ]);
    const post = posts[0];

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found', data: null });
    }

    if (!userId || post.author_id !== userId) {
      return res.status(401).json({ message: 'No permission', data: null });
    }

    await pool.query(
      `UPDATE post SET title = ?, text =?, image_url = ?, updated_at = ? WHERE id = ?`,
      [
        title || post.title,
        text || post.text,
        imageUrl || null,
        new Date().toISOString(),
        postId,
      ]
    );

    res.status(200).json({ message: 'post updated', data: null });
  } catch (error) {
    console.log('댓글 수정 실패', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 모든 게시글 가져오기
export const getAllPosts = async (req, res) => {
  try {
    // const [posts] = await pool.query(`SELECT * FROM post`);
    const [posts] = await pool.query(`
      SELECT 
        post.id,
        post.title, 
        post.text, 
        post.created_at, 
        post.likes, 
        post.views, 
        post.comments, 
        user.nickname AS author_nickname,
        user.profile_url AS author_profile_url
      FROM post
      JOIN user ON post.author_id = user.id
      ORDER BY post.created_at DESC
      `);

    res.status(200).json({ message: 'Posts retrieved', data: posts });
  } catch (error) {
    console.error('게시글 목록 가져오기 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const [posts] = await pool.query(`SELECT * FROM post WHERE id = ?`, [
      postId,
    ]);

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found', data: null });
    }

    const post = posts[0];
    if (post.author_id !== userId) {
      return res.status(403).json({ message: 'No permission', data: null });
    }

    await pool.query(`DELETE FROM post WHERE id = ?`, [postId]);

    res.status(204).send();
  } catch (error) {
    console.error('게시글 삭제 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 좋아요 상태 확인
export const getLikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  try {
    const [likes] = await pool.query(
      `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );

    const isLiked = likes.length > 0;

    res
      .status(200)
      .json({ message: 'Like status retrieved', data: { isLiked } });
  } catch (error) {
    console.error(`좋아요 상태 확인 실패: ${error}`);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 좋아요 추가/삭제
export const toggleLikePost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  if (!postId) {
    return res.status(400).json({ message: 'Invalid post ID', data: null });
  }
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const [posts] = await pool.query(`SELECT * FROM post WHERE id = ?`, [
      postId,
    ]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found', data: null });
    }

    const [likes] = await pool.query(
      `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );

    if (likes.length > 0) {
      // 좋아요 취소
      await pool.query(`DELETE FROM likes WHERE id = ?`, [likes[0].id]);
      await pool.query(`UPDATE post SET likes = likes - 1 WHERE id = ?`, [
        postId,
      ]);
      return res.status(200).json({
        message: 'Like removed',
        data: { isLiked: false },
      });
    } else {
      // 좋아요 추가
      await pool.query(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`, [
        postId,
        userId,
      ]);
      await pool.query(`UPDATE post SET likes = likes + 1 WHERE id = ?`, [
        postId,
      ]);
      return res.status(200).json({
        message: 'Like added',
        data: { isLiked: true },
      });
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};
