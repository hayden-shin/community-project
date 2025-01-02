import path from 'path';
import fs from 'fs';

const POST_FILE = path.join(process.cwd(), '../data/post.json');
const COMMENT_FILE = path.join(process.cwd(), '../data/comment.json');

// 새 게시글 생성
export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const postImage = req.file ? `/assets/${req.file.filename}` : null;

    const newPost = {
      id: posts.length + 1,
      title,
      content,
      postImage,
      authorId: userId,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    };
    posts.push(newPost);

    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    return res.status(201).json({
      message: 'post create success',
      data: newPost,
    });
  } catch (err) {
    console.error('게시글 생성 실패:', err);
    return res
      .status(500)
      .json({ message: 'internal server error', data: null });
  }
};

// 특정 게시글 가져오기
export const getPostById = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == postId);

    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    // 댓글 가져오기
    const comments = JSON.parse(fs.readFileSync(COMMENT_FILE, 'utf-8'));
    const postComments = comments.filter((c) => c.postId == postId);

    // 조회수 증가
    post.viewCount += 1;
    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    res.status(200).json({
      message: 'post retrieve success',
      data: { post, comments: postComments },
    });
  } catch (error) {
    console.error('게시글 가져오기 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 게시글 수정
export const editPost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  const { title, content } = req.body;
  const postImage = req.file ? `/assets/${req.file.filename}` : null;

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-9'));
    const post = posts.find((p) => p.id == postId);

    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    if (!userId || post.authorId !== userId) {
      return res.status(401).json({ message: 'no permission', data: null });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (postImage) post.postImage = postImage;
    post.updatedAt = new Date().toISOString();

    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    res.status(200).json({ message: 'post update success', data: null });
  } catch (error) {
    console.log('게시글 수정 실패', error);
    res.status(500).json({ message: 'internal server error', data: null });
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
        post.content, 
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
