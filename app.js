const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');

// 기본 미들웨어 설정
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 라우트 설정
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/comments', commentRoutes);

// JSON 파일 경로
const POSTS_FILE = path.join(__dirname, 'data/posts.json');
const USERS_FILE = path.join(__dirname, 'data/users.json');
const COMMENTS_FILE = path.join(__dirname, 'data/comments.json');

// 더미 데이터 로드
let posts = [];
let users = [];
let comments = [];

// JSON 데이터 로드 함수
const loadJSONData = () => {
  try {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
    console.log('JSON 데이터가 성공적으로 로드되었습니다.');
  } catch (error) {
    console.error('JSON 데이터 로드 중 에러 발생:', error);
  }
};

// JSON 데이터 저장 함수
const saveJSONData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${filePath}에 데이터가 저장되었습니다.`);
  } catch (error) {
    console.error(`${filePath} 저장 중 에러 발생:`, error);
  }
};

// 서버 초기화 시 JSON 데이터 로드
loadJSONData();

// 기본 라우트
app.get('/', (req, res) => {
  res.send('아무 말 대잔치 커뮤니티입니다.');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}.`);
});
