import express from 'express';
import {
  signup,
  login,
  logout,
  deleteAccount,
} from '../controllers/userController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router({ mergeParams: true });

// 회원가입
router.post('/signup', upload, signup);

// 로그인
router.post('/login', login);

// 로그아웃
router.post('/logout', logout);

// 회원 탈퇴
router.delete('/account', deleteAccount);

export default router;
