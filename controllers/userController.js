const path = require('path');
const { readJSONFile, writeJSONFile } = require('../utils/fileUtils');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// 회원가입
const signupUser = (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) {
    return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
  }

  const users = readJSONFile(USERS_FILE);
  const isEmailTaken = users.some((user) => user.email === email);

  if (isEmailTaken) {
    return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    nickname,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJSONFile(USERS_FILE, users);
  res.status(201).json(newUser);
};

// 닉네임 변경
const updateNickname = (req, res) => {
  const { user_id } = req.params;
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }

  if (nickname.length > 10) {
    return res
      .status(400)
      .json({ message: '닉네임은 최대 10자 까지 작성 가능합니다.' });
  }

  const users = readJSONFile(USERS_FILE);

  // 닉네임 중복 검사
  const isNicknameTaken = users.some((user) => user.nickname === nickname);
  if (isNicknameTaken) {
    return res.status(400).json({ message: '중복된 닉네임 입니다.' });
  }

  const userIndex = users.findIndex((user) => user.id === Number(user_id));
  if (userIndex === -1) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  // 닉네임 변경
  users[userIndex].nickname = nickname;
  users[userIndex].updatedAt = new Date().toISOString();

  writeJSONFile(USERS_FILE, users);

  res.status(200).json({
    message: '닉네임이 성공적으로 변경되었습니다.',
    user: { id: users[userIndex].id, nickname: users[userIndex].nickname },
  });
};

// 비밀번호 변경
const updatePassword = (req, res) => {
  const { user_id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: '비밀번호를 입력해주세요.' });
  }

  if (!confirmPassword) {
    return res
      .status(400)
      .json({ message: '비밀번호를 한번 더 입력해주세요.' });
  }

  // 비밀번호 확인
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: '비밀번호 확인과 다릅니다.' });
  }

  // 비밀번호 유효성 검사
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
    });
  }

  const users = readJSONFile(USERS_FILE);

  const userIndex = users.findIndex((user) => user.id === Number(user_id));
  if (userIndex === -1) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  // 비밀번호 변경
  users[userIndex].password = newPassword;
  users[userIndex].updatedAt = new Date().toISOString();

  writeJSONFile(USERS_FILE, users);

  res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
};

// 회원 탈퇴
const deleteUser = (req, res) => {
  const { user_id } = req.params;
  const users = readJSONFile(USERS_FILE);

  const newUsers = users.filter((u) => u.id !== Number(user_id));
  if (users.length === newUsers.length) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  writeJSONFile(USERS_FILE, newUsers);
  res.status(204).send();
};

module.exports = { signupUser, updateNickname, updatePassword, deleteUser };
