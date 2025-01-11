import path from 'path';
import fs from 'fs';

const POST_FILE = path.join(process.cwd(), 'data', 'post.json');
const COMMENT_FILE = path.join(process.cwd(), 'data', 'comment.json');
const LIKE_FILE = path.join(process.cwd(), 'data', 'like.json');

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
    const imageUrl = req.file ? `/assets/${req.file.filename}` : null;

    const newPost = {
      id: posts.length + 1,
      title,
      content,
      imageUrl,
      author: {
        id: userId,
        url: req.session.user.url,
        username: req.session.user.username,
      },
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
  const imageUrl = req.file ? `/assets/${req.file.filename}` : null;

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == postId);

    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    if (!userId || post.author.id !== userId) {
      return res.status(401).json({ message: 'no permission', data: null });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;
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
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));

    res.status(200).json({ message: 'posts retrieve success', data: posts });
  } catch (error) {
    console.error('게시글 목록 가져오기 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
  const postId = parseInt(req.params.post_id);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const index = posts.findIndex((p) => p.id == postId);

    if (index == -1) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    if (posts[index].author.id !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    posts.splice(index, 1);
    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    res.status(204).send();
  } catch (error) {
    console.error('게시글 삭제 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

/*
  -------- 좋아요  --------
*/

// 좋아요 상태 확인
export const getLikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  try {
    const likes = JSON.parse(fs.readFileSync(LIKE_FILE, 'utf-8'));
    const isLiked = likes.some((l) => l.postId == postId && l.userId == userId);

    res
      .status(200)
      .json({ message: 'like status retrieve success', data: { isLiked } });
  } catch (error) {
    console.error(`좋아요 상태 확인 실패: ${error}`);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 좋아요 추가/삭제
export const toggleLikePost = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  if (!postId) {
    return res.status(400).json({ message: 'invalid post', data: null });
  }
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == postId);

    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    const likes = JSON.parse(fs.readFileSync(LIKE_FILE, 'utf-8'));
    const index = likes.findIndex(
      (l) => l.postId == postId && l.userId == userId
    );

    if (index !== -1) {
      // 좋아요 취소
      likes.splice(index, 1);
      fs.writeFileSync(LIKE_FILE, JSON.stringify(likes, null, 2));

      post.likeCount -= 1;
      fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

      return res.status(200).json({
        message: 'like remove success',
        data: { isLiked: false, likeCount: post.likeCount },
      });
    } else {
      // 좋아요 추가
      const newLike = {
        id: likes.length + 1,
        userId,
        postId,
        createdAt: new Date().toISOString(),
      };

      likes.push(newLike);
      fs.writeFileSync(LIKE_FILE, JSON.stringify(likes, null, 2));

      post.likeCount += 1;
      fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));
      return res.status(200).json({
        message: 'like add success',
        data: { isLiked: true, likeCount: post.likeCount },
      });
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
