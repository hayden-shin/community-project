import fs from 'fs';
import path from 'path';

const POST_FILE = path.join(process.cwd(), 'data', 'post.json');
const COMMENT_FILE = path.join(process.cwd(), 'data', 'comment.json');

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

  const { username, profileImage } = req.session?.user;

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
        username,
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
  } catch (err) {
    console.error('댓글 생성 실패:', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 특정 게시글의 댓글 가져오기
export const getCommentsByPostId = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const comments = JSON.parse(fs.readFileSync(COMMENT_FILE, 'utf-8'));
    const postComments = comments.filter((c) => c.postId == postId);

    res.status(200).json({
      message: 'comments retrieve success',
      data: { comments: postComments },
    });
  } catch (err) {
    console.error('댓글 가져오기 실패:', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const { content } = req.body;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!commentId || !content) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comments = JSON.parse(fs.readFileSync(COMMENT_FILE, 'utf-8'));
    const comment = comments.find((c) => c.id == commentId);

    if (!comment) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }

    if (comment.author.id !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    comment.content = content;
    comment.updatedAt = new Date().toISOString();
    fs.writeFileSync(COMMENT_FILE, JSON.stringify(comments, null, 2));

    res.status(200).json({ message: 'comment update success', data: null });
  } catch (err) {
    console.error('댓글 수정 실패: ', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!commentId) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comments = JSON.parse(fs.readFileSync(COMMENT_FILE, 'utf-8'));
    const index = comments.findIndex((c) => c.id == commentId);

    if (index == -1) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }

    if (comments[index].author.id !== userId) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    comments.splice(index, 1);
    fs.writeFileSync(COMMENT_FILE, JSON.stringify(comments, null, 2));

    // 게시글 댓글수 -1
    const posts = JSON.parse(fs.readFileSync(POST_FILE, 'utf-8'));
    const post = posts.find((p) => p.id == parseInt(req.params.post_id, 10));
    post.commentCount -= 1;
    fs.writeFileSync(POST_FILE, JSON.stringify(posts, null, 2));

    res.status(204).send();
  } catch (err) {
    console.error('댓글 삭제 실패: ', err);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
