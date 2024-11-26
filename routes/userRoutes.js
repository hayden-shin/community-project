const express = require('express');
const {
  signupUser,
  updateNickname,
  updatePassword,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// 회원가입
router.post('/signup', signupUser);

// 닉네임 변경
router.patch('/:user_id', updateNickname);

// 비밀번호 변경
router.patch('/:user_id', updatePassword);

// 계정 탈퇴
router.delete('/:user_id', deleteUser);

module.exports = router;
