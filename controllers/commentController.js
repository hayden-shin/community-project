import {
  readCommentsFromFile,
  writeCommentsToFile,
} from '../models/commentModel.js';

import { readPostsFromFile, writePostsToFile } from '../models/postModel.js';

// 댓글 생성
export const createComment = async (req, res) => {
  const { text } = req.body;
  const user = req.session?.user;
  console.log('유저 세션 확인:', req.session.user);
  const postId = parseInt(req.params.post_id, 10);
  console.log('포스트 아이디: ', postId);

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!postId || isNaN(postId)) {
    res.status(400).json({ message: 'invalid post ID', data: null });
  }

  if (!text) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comments = await readCommentsFromFile();
    const posts = await readPostsFromFile();

    const newCommentId = comments.length + 1;

    const newComment = {
      comment_id: newCommentId,
      post_id: postId,
      text,
      created_at: new Date().toISOString(),
      author_id: user.id,
      author_profile_url: user.profile_url,
      author_nickname: user.nickname,
    };

    comments.push(newComment);
    await writeCommentsToFile(comments);

    const post = posts.find((p) => p.post_id == postId);
    if (post) {
      post.comment_ids.push(newCommentId);
      await writePostsToFile(posts);
    }

    res.status(201).json({ message: 'comment created', data: newComment });
  } catch (error) {
    console.error('댓글 생성 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 특정 게시글의 댓글 가져오기
export const getCommentsByPostId = async (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const comments = await readCommentsFromFile();
    const postComments = comments.filter(
      (comment) => comment.post_id === postId
    );

    res.status(200).json({ message: 'comments retrieved', data: postComments });
  } catch (error) {
    console.error('댓글 가져오기 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const { text } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!commentId || !text) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comments = await readCommentsFromFile();

    const comment = comments.find((c) => c.comment_id === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }

    if (comment.author_id !== user.id) {
      return res.status(403).json({ message: 'no permission', data: null });
    }

    comment.text = text;
    comment.updated_at = new Date().toISOString();
    await writeCommentsToFile(comments);

    res.status(200).json({ message: 'comment updated', data: comment });
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  // const { comment_id } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!commentId) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const comments = await readCommentsFromFile();
    const posts = await readPostsFromFile();

    const commentIndex = comments.findIndex((c) => c.comment_id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'comment not found', data: null });
    }

    const comment = comments[commentIndex];
    if (comment.author_id !== user.id) {
      return res.status(403).json({ message: 'no permission', data: null });
    }
    const postId = comments[commentIndex].post_id;
    comments.splice(commentIndex, 1);
    await writeCommentsToFile(comments);

    const post = posts.find((p) => p.post_id === postId);
    if (post) {
      post.comment_ids = post.comment_ids.filter((id) => id !== commentId);
      await writePostsToFile(posts);
    }

    res.status(204).send();
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
