import express from 'express';
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from '../controller/commentController.js';

const router = express.Router({ mergeParams: true });

// 댓글 생성
router.post('/', createComment);

// 특정 게시글의 댓글 가져오기
router.get('/', getCommentsByPostId);

// 댓글 수정
router.patch('/:comment_id', updateComment);

// 댓글 삭제
router.delete('/:comment_id', deleteComment);

export default router;
