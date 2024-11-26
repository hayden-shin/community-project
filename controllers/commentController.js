const path = require('path');
const { readJSONFile, writeJSONFile } = require('../utils/fileUtils');

const COMMENTS_FILE = path.join(__dirname, '../data/comments.json');

// 게시글 댓글 불러오기
const getCommentsByPost = (req, res) => {
  const { postId } = req.query;
  const comments = readJSONFile(COMMENTS_FILE);

  const filteredComments = comments.filter((c) => c.postId === Number(postId));
  res.json(filteredComments);
};

// 댓글 작성
const createComment = (req, res) => {
  const { post_d, content, author } = req.body;

  if (!postId || !content || !author) {
    return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
  }

  const comments = readJSONFile(COMMENTS_FILE);
  const newComment = {
    id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
    postId: Number(postId),
    content,
    author,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  writeJSONFile(COMMENTS_FILE, comments);
  res.status(201).json(newComment);
};

// 댓글 수정
const updateComment = (req, res) => {
  const { comment_id } = req.params;
  const { content } = req.body;
  const comments = readJSONFile(COMMENTS_FILE);

  const commentIndex = comments.findIndex((c) => c.id === Number(comment_id));
  if (commentIndex === -1) {
    return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
  }

  comments[commentIndex] = {
    ...comments[commentIndex],
    content: content || comments[commentIndex].content,
    updatedAt: new Date().toISOString(),
  };

  writeJSONFile(COMMENTS_FILE, comments);
  res.json(comments[commentIndex]);
};

// 댓글 삭제
const deleteComment = (req, res) => {
  const { comment_id } = req.params;
  const comments = readJSONFile(COMMENTS_FILE);

  const newComments = comments.filter((c) => c.id !== Number(comment_id));
  if (comments.length === newComments.length) {
    return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
  }

  writeJSONFile(COMMENTS_FILE, newComments);
  res.status(204).send();
};

module.exports = {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
};
