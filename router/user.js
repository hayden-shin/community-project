import express from 'express';
import {
  getUserProfile,
  updateProfile,
  updatePassword,
} from '../controller/user.js';

import { upload } from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

// 사용자 프로필 가져오기
router.get('/profile', getUserProfile);

// 사용자 정보 변경
router.patch('/profile', upload, updateProfile);

// 비밀번호 변경
router.patch('/password', updatePassword);

export default router;
