import { readUsersFromFile, writeUsersToFile } from '../models/userModel.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const SERVER_URL = 'http://localhost:3000';

// 회원가입
export const signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  // 프로필 이미지 처리
  let profileUrl = req.file
    ? `${SERVER_URL}/assets/${req.file.filename}`
    : `${SERVER_URL}/assets/default-profile.jpg`;

  try {
    const users = await readUsersFromFile();

    if (users.some((user) => user.email === email)) {
      return res
        .status(400)
        .json({ message: 'email already exists', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
    const newUser = {
      id: users.length + 1,
      profile_url: profileUrl,
      email,
      password: hashedPassword,
      nickname,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);

    await writeUsersToFile(users);

    res.status(201).json({
      message: 'register success',
      data: newUser,
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
    const users = await readUsersFromFile();
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'login fail', data: null });
    }

    const isPasswordMatch = bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'login fail', data: null });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profile_url: user.profile_url,
    };

    // HttpOnly 쿠키 발급
    console.log('세션 저장된 사용자: ', req.session.user);

    res.cookie('sessionId', req.sessionID, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24시간 유지
    });

    res.status(200).json({
      message: 'login_success',
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profile_url: user.profile_url,
      },
    });
  } catch (error) {
    console.error('로그인 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 로그아웃
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'internal_server_error', data: null });
    }
    res.clearCookie('sessionId');
    res.status(204).send({ message: 'Logged out successfully' });
  });
};

// 사용자 프로필 가져오기
export const getUserProfile = async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = await readUsersFromFile();
    const user = users.find((u) => u.id === userId);
    // 유저 정보 반환
    res.status(200).json({
      message: 'user_profile_retrieved',
      data: {
        email: user.email,
        nickname: user.nickname,
        profileImage:
          user.profile_url || `${SERVER_URL}/assets/default-profile.jpg`, // 기본 프로필 이미지 제공
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// 사용자 정보 수정
export const updateProfile = async (req, res) => {
  const userId = req.session?.user?.id;
  const { newEmail, newNickname } = req.body;
  const newProfileImage = req.file
    ? `${SERVER_URL}/assets/${req.file.filename}`
    : null;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = await readUsersFromFile();
    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'not found', data: null });
    }

    if (newEmail) user.email = newEmail;
    if (newNickname) user.nickname = newNickname;
    if (newProfileImage) user.profile_url = newProfileImage;

    await writeUsersToFile(users);
    res.status(200).json({ message: 'profile updated', data: null });
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 비밀번호 변경
export const updatePassword = async (req, res) => {
  const userId = req.session?.user?.id;
  const { newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!newPassword) {
    return res
      .status(400)
      .json({ message: 'new_password_required', data: null });
  }

  try {
    const users = await readUsersFromFile();
    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found', data: null });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await writeUsersToFile(users);

    res.status(200).json({ message: 'profile updated', data: null });
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 회원 탈퇴
export const deleteAccount = async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = await readUsersFromFile();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (
      userIndex === -1 ||
      !bcrypt.compareSync(password, users[userIndex].password)
    ) {
      return res.status(401).json({ message: 'unauthorized', data: null });
    }

    users.splice(userIndex, 1);
    await writeUsersToFile(users);

    req.session.destroy();
    res.clearCookie('user_session');
    res.status(204).send();
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 작성자 프로필 정보 가져오기
export const getAuthorProfile = async (req, res) => {
  const authorId = parseInt(req.params.author_id, 10);

  if (!authorId) {
    return res.status(400).json({ message: 'invalid_author_id', data: null });
  }

  try {
    const users = await readUsersFromFile();
    const author = users.find((user) => user.id === authorId);

    if (!author) {
      return res.status(404).json({ message: 'author_not_found', data: null });
    }

    // 작성자 프로필 정보 반환
    res.status(200).json({
      message: 'author_profile_retrieved',
      data: {
        nickname: author.nickname,
        profile_url: author.profile_url || '/assets/default-profile.jpg',
      },
    });
  } catch (error) {
    console.error('작성자 프로필 정보 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};
