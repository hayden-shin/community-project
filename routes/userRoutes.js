import express from 'express';
import {
  getUserProfile,
  updateProfile,
  updatePassword,
  getAuthorProfile,
} from '../controllers/userController.js';

import { upload } from '../middlewares/upload.js';

const router = express.Router({ mergeParams: true });

// 사용자 프로필 가져오기
router.get('/profile', getUserProfile);

// 프로필 수정
router.patch('/profile', upload, updateProfile);

// 비밀번호 변경
router.patch('/password', updatePassword);

// 작성자 정보 가져오기
router.get('/:author_id', getAuthorProfile);

export default router;
