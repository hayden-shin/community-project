import express from 'express';
import * as commentController from '../controller/comment.js';

const router = express.Router({ mergeParams: true });

// 댓글 생성
router.post('/', commentController.createComment);

// 특정 게시글의 댓글 가져오기
router.get('/', commentController.getCommentsByPostId);

// 댓글 수정
router.patch('/:comment_id', commentController.updateComment);

// 댓글 삭제
router.delete('/:comment_id', commentController.deleteComment);

export default router;
