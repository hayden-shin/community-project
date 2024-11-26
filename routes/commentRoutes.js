const express = require('express');
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

const router = express.Router();

// 댓글 출력
router.get('/', getCommentsByPost);

// 댓글 등록
router.post('/', createComment);

// 댓글 수정
router.patch('/:comment_id', updateComment);

// 댓글 삭제
router.delete('/:comment_id', deleteComment);

module.exports = router;
