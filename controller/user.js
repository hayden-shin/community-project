import bcrypt from 'bcrypt';
import { config } from '../config.js';
import * as userRepository from '../model/user.js';

// 회원가입
export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  const url = req.file
    ? `/assets/${req.file.filename}`
    : `/assets/default-profile-image.jpg`;

  try {
    if (sitory.findByEmail(email)) {
      return res
        .status(400)
        .json({ message: 'Email already exists', data: null });
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = {
      email,
      password: hashed,
      username,
      url,
      createdAt: new Date().toISOString(),
    };
    await userRepository.createUser(user);

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
    const user = await userRepository.findByEmail(email);
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
      url: user.url,
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
    const user = await userRepository.findById(userId);

    res.status(200).json({
      message: 'user profile retrieved',
      data: {
        id: userId,
        email: user.email,
        username: user.username,
        url: `${config.url.baseUrl}${user.url}`,
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
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    if (await userRepository.findByUsername(username)) {
      return res
        .status(400)
        .json({ message: 'Username already exists', data: null });
    }
    if (username) {
      user.username = username;
      await userRepository.updateUsername(user);
    }

    const url = req.file
      ? `/assets/${req.file.filename}`
      : user.url || `/assets/default-profile-image.jpg`;
    if (url) {
      user.url = url;
      await userRepository.updateUrl(user);
    }

    const updated = await userRepository.findById(userId);
    req.session.user = {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      url: updated.url,
    };

    res.status(200).json({
      message: 'profile update success',
      data: { username, url },
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
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    user.password = hashed;
    await userRepository.updatePassword(user.password, id);

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
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    await userRepository.deleteUser(userId);

    req.session.destroy();
    res.clearCookie('sessionId');
    res.status(204).send();
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
