import express from 'express';
import {
  createPost,
  getPostById,
  getAllPosts,
  editPost,
  deletePost,
  getLikeStatus,
  toggleLikePost,
} from '../controller/post.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router({ mergeParams: true });

// 새 게시글 생성
router.post('/', upload, createPost);

// 특정 게시글 가져오기
router.get('/:post_id', getPostById);

// 모든 게시글 가져오기
router.get('/', getAllPosts);

// 게시글 수정
router.patch('/:post_id', upload, editPost);

// 게시글 삭제
router.delete('/:post_id', deletePost);

// 좋아요 상태 확인
router.get('/:post_id/likes', getLikeStatus);

// 좋아요 추가
router.post('/:post_id/likes', toggleLikePost);

// 좋아요 취소
router.delete('/:post_id/likes', toggleLikePost);

export default router;
