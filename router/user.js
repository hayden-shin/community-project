import express from 'express';
import * as userController from '../controller/user.js';
import { upload } from '../middleware/upload.js';
const router = express.Router({ mergeParams: true });

// 사용자 프로필 가져오기
router.get('/profile', userController.getUserProfile);

// 사용자 정보 변경
router.patch('/profile', upload, userController.updateProfile);

// 비밀번호 변경
router.patch('/password', userController.updatePassword);

export default router;
