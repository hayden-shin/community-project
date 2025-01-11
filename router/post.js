import express from 'express';
import * as postController from '../controller/post.js';
import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// 새 게시글 생성
router.post('/', upload, postController.createPost);

// 특정 게시글 가져오기
router.get('/:post_id', postController.getPostById);

// 모든 게시글 가져오기
router.get('/', postController.getAllPosts);

// 게시글 수정
router.patch('/:post_id', upload, postController.editPost);

// 게시글 삭제
router.delete('/:post_id', postController.deletePost);

// 좋아요 상태 확인
router.get('/:post_id/likes', postController.getLikeStatus);

// 좋아요 추가
router.post('/:post_id/likes', postController.toggleLikePost);

// 좋아요 취소
router.delete('/:post_id/likes', postController.toggleLikePost);

export default router;
