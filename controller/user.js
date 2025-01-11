import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { config } from '../config.js';
import * as userRepository from '../model/user.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

// 회원가입
export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  const profileImage = req.file
    ? `/assets/${req.file.filename}`
    : `/assets/default-profile-image.jpg`;

  try {
    if (userRepository.findByEmail(email)) {
      return res
        .status(400)
        .json({ message: 'Email already exists', data: null });
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = {
      email,
      password: hashed,
      username,
      profileImage,
      createdAt: new Date().toISOString(),
    };
    userRepository.createUser(user);

    res.status(201).json({
      message: 'register success',
      data: user.insertId,
    });
  } catch (error) {
    console.error('회원가입 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 로그인
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Invalid email or password', data: null });
  }

  try {
    const user = userRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'invalid user', data: null });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: 'incorrect password', data: null });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      profileImage: user.profileImage,
    };

    console.log('세션에 저장된 사용자: ', req.session?.user);

    // HttpOnly 쿠키 발급
    res.cookie('sessionId', req.sessionID, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: config.session.expiresInSec,
    });

    res.status(200).json({
      message: 'login success',
      data: { user },
    });
  } catch (error) {
    console.error('로그인 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 로그아웃
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'internal server error', data: null });
    }
    res.clearCookie('sessionId');
    res.status(204);
  });
};

// 사용자 프로필 가져오기
export const getUserProfile = async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const user = userRepository.findById(userId);

    res.status(200).json({
      message: 'user profile retrieved',
      data: {
        id: userId,
        email: user.email,
        username: user.username,
        profileImage: `${config.url.baseUrl}${user.profileImage}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// 사용자 정보 수정
export const updateProfile = async (req, res) => {
  const userId = req.session?.user?.id;
  const { username } = req.body;
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const user = userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    if (userRepository.findByUsername(username)) {
      return res
        .status(400)
        .json({ message: 'Username already exists', data: null });
    }
    if (username) {
      user.username = username;
      userRepository.updateUsername(user);
    }

    const profileImage = req.file
      ? `/assets/${req.file.filename}`
      : user.profileImage || `/assets/default-profile-image.jpg`;
    if (profileImage) {
      user.profileImage = profileImage;
      userRepository.updateUrl(user);
    }

    const updated = userRepository.findById(userId);
    const { id, email, username, profileImage } = updated;
    // 세션에 저장된 사용자 정보 수정
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      profileImage: user.profileImage,
    };

    console.log('세션에 저장된 사용자: ', req.session?.user);

    res.status(200).json({
      message: 'profile update success',
      data: { username, profileImage },
    });
  } catch (error) {
    console.error('사용자 정보 수정 실패: ', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 비밀번호 변경
export const updatePassword = async (req, res) => {
  const userId = req.session?.user?.id;
  const { password } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    const user = users.find((u) => u.id == userId);

    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(
        password,
        config.bcrypt.saltRounds
      );
      user.password = hashedPassword;
    }

    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));

    res.status(200).json({ message: 'password update success', data: null });
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 회원 탈퇴
export const deleteAccount = async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    const index = users.findIndex((u) => u.id == userId);

    if (index == -1) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    users.splice(index, 1);
    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));

    req.session.destroy();
    res.clearCookie('sessionId');
    res.status(204).send();
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
