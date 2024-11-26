const express = require('express');
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

// 게시글 목록 조회
router.get('/', getAllPosts);

// 게시글 상세 조회
router.get('/:post_id', getPostById);

// 게시글 작성
router.post('/', createPost);

// 게시글 수정
router.patch('/:post_id', updatePost);

// 게시글 삭제
router.delete('/:post_id', deletePost);

module.exports = router;
