import express from 'express';
import * as authController from '../controllers/userController.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router({ mergeParams: true });

// 회원가입
router.post('/signup', upload, authController.signup);

// 로그인
router.post('/login', authController.login);

// 로그아웃
router.post('/logout', authController.logout);

// 회원 탈퇴
router.delete('/account', authController.deleteAccount);

export default router;
