import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const USER_FILE = path.join(process.cwd(), '../data/user.json');

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const BASE_URL = 'http://localhost:3000';

// 회원가입
export const signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  let profileImage = req.file
    ? `/assets/${req.file.filename}`
    : `/assets/default-profile-image.jpg`;

  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));

    if (users.find((u) => u.email == email)) {
      return res
        .status(400)
        .json({ message: 'email already exist', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      profileImage,
      email,
      password: hashedPassword,
      nickname,
      createdAt: Date.now(),
    };
    users.push(newUser);

    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));

    res.status(201).json({
      message: 'register success',
      data: newUser.userId,
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
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(400).json({ message: 'invalid user', data: null });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: 'incorrect password', data: null });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
    };

    console.log('세션에 저장된 사용자: ', req.session?.user);

    // HttpOnly 쿠키 발급
    res.cookie('sessionId', req.sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24시간 유지
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
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    const user = users.find((u) => u.id == userId);

    res.status(200).json({
      message: 'user profile retrieved',
      data: {
        email: user.email,
        nickname: user.nickname,
        profileImage: `${BASE_URL}${user.profileImage}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// 사용자 정보 수정
export const updateProfile = async (req, res) => {
  const userId = req.session?.user?.id;
  const { email, nickname } = req.body;
  const profileImage = req.file
    ? `/assets/${req.file.filename}`
    : user.profileImage || `/assets/default-profile-image.jpg`;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
    const user = users.find((u) => u.id == userId);

    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    // validate new email if provided
    if (users.some((u) => u.email == email && u.id !== userId)) {
      return res
        .status(400)
        .json({ message: 'email already exists', data: null });
    }
    if (email) user.email = email;

    // validate new nickname if provided
    if (users.some((u) => u.nickname == nickname && u.id !== userId)) {
      return res
        .status(400)
        .json({ message: 'nickname already exists', data: null });
    }
    if (nickname) user.nickname = nickname;
    if (profileImage) user.profileImage = profileImage;

    fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));

    res.status(200).json({ message: 'profile update success', data: null });
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
      const hashedPassword = await bcrypt.hash(password, 10);
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
