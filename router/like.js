import express from 'express';
import * as likeController from '../controller/like.js';
const router = express.Router({ mergeParams: true });

// 좋아요 상태 확인
router.get('/', likeController.getLikeStatus);

// 좋아요 추가
router.post('/', likeController.toggleLikePost);

// 좋아요 취소
router.delete('/', likeController.toggleLikePost);

export default router;
