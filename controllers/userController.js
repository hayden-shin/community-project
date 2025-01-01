import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const BASE_URL = 'http://localhost:3000';

// 회원가입
export const signup = async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'invalid request', data: null });
  }

  // 프로필 이미지
  let profileUrl = req.file
    ? `/assets/${req.file.filename}`
    : `/assets/default-profile.jpg`;

  try {
    // 이메일, 닉네임 중복검사
    const [users] = await pool.query(`SELECT * FROM user WHERE email = ?`, [
      email,
    ]);

    if (users.length > 0) {
      return res
        .status(400)
        .json({ message: 'Email already exist', data: null });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO user (email, password, nickname, profile_url) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, nickname, profileUrl]
    );

    res.status(201).json({
      message: 'Register success',
      data: result.insertId,
    });
  } catch (error) {
    console.error('회원가입 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 로그인
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Invalid request', data: null });
  }

  try {
    const [users] = await pool.query(`SELECT * FROM user WHERE email = ?`, [
      email,
    ]);

    if (users.length == 0) {
      return res.status(400).json({ message: 'Invalid user', data: null });
    }

    const user = users[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: 'Incorrect password', data: null });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileUrl: user.profile_url,
    };

    console.log('세션 저장된 사용자: ', req.session?.user);

    // HttpOnly 쿠키 발급
    res.cookie('sessionId', req.sessionID, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 24시간 유지
    });

    res.status(200).json({
      message: 'Login success',
      data: { user },
    });
  } catch (error) {
    console.error('로그인 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 로그아웃
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Internal server error', data: null });
    }
    res.clearCookie('sessionId');
    res.status(204).send({ message: 'Logged out successfully' });
  });
};

// 사용자 프로필 가져오기
export const getUserProfile = async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const [users] = await pool.query(`SELECT * FROM user WHERE id = ?`, [
      userId,
    ]);
    const user = users[0];

    res.status(200).json({
      message: 'User profile retrieved',
      data: {
        email: user.email,
        nickname: user.nickname,
        profileUrl: `${BASE_URL}${user.profile_url}`,
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
  const profileUrl = req.file
    ? `/assets/${req.file.filename}`
    : `/assets/default-profile.jpg`;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const [users] = await pool.query(`SELECT * FROM user WHERE id = ?`, [
      userId,
    ]);
    const user = users[0];

    if (users.length == 0) {
      return res.status(404).json({ message: 'User not found', data: null });
    }

    if (email) user.email = email;
    if (nickname) user.nickname = nickname;
    if (profileUrl) user.profile_url = profileUrl;

    const updatedEmail = email || user.email;
    const updatedNickname = nickname || user.nickname;
    const updatedProfileUrl = profileUrl || user.profile_url;

    await pool.query(
      `UPDATE user SET email = ?, nickname =?, profile_url =? WHERE id = ?`,
      [updatedEmail, updatedNickname, updatedProfileUrl, userId]
    );

    res
      .status(200)
      .json({ message: 'Profile updated successfully', data: null });
  } catch (error) {
    console.error('사용자 정보 수정 실패: ', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 비밀번호 변경
export const updatePassword = async (req, res) => {
  const userId = req.session?.user?.id;
  const { password } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  if (!password) {
    return res
      .status(400)
      .json({ message: 'New password required', data: null });
  }

  try {
    const [users] = await pool.query(`SELECT * FROM user WHERE id = ?`, [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`UPDATE user SET password = ? WHERE id = ?`, [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({ message: 'Profile updated', data: null });
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    res.status(500).json({ message: 'Internal server error', data: null });
  }
};

// 회원 탈퇴
export const deleteAccount = async (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized', data: null });
  }

  try {
    const [users] = await pool.query(`SELECT * FROM user WHERE id = ?`, [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found', data: null });
    }

    await pool.query(`DELETE FROM user WHERE id = ?`, [userId]);

    // 세션 및 쿠키 삭제
    req.session.destroy();
    res.clearCookie('sessionId');
    res.status(204).send();
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
