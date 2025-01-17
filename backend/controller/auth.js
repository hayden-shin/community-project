import bcrypt from 'bcrypt';
import { config } from '../config.js';
import * as userRepository from '../model/auth.js';
import { uploadS3 } from '../middleware/upload.js';

// 회원가입
export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  const url = req.file ? await uploadS3(req.file) : null;

  try {
    if (await userRepository.findByEmail(email)) {
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
    };
    const id = await userRepository.createUser(user);

    res.status(201).json({
      message: 'register success',
      data: id,
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

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
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
    res.status(204).send();
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
    if (!user) {
      return res.status(404).json({ message: 'User not found', data: null });
    }

    res.status(200).json({
      message: 'user profile retrieved',
      data: {
        id: userId,
        email: user.email,
        username: user.username,
        url: `${config.s3.cdnUrl}${user.url}` || null,
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

    if (username) {
      if (userId !== user.id) {
        return res
          .status(400)
          .json({ message: 'Username already exists', data: null });
      }
      await userRepository.updateUsername(username, userId);
    }

    const url = req.file ? await uploadS3(req.file) : null;
    if (url) {
      await userRepository.updateUrl(url, userId);
    }

    const updated = await userRepository.findById(userId);

    req.session.user = {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      url: updated.url,
    };

    res.status(200).send({ username: updated.username, url: updated.url });
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
    await userRepository.updatePassword(hashed, userId);

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
