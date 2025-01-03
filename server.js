import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();
const PORT = 3000;

// DB
// import conn from './database/connect/maria.js';

// CORS 설정
const corsOptions = {
  origin: `http://localhost:2000`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-USER-ID'],
  credentials: true,
};

// 세션 설정
app.use(
  session({
    secret: 'MY_SWEET_HOME',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS가 아닌 경우 false로 설정
      httpOnly: true, // 클라이언트에서 쿠키를 접근하지 못하도록 설정
      sameSite: 'lax', // 크로스-도메인 요청에서 쿠키 허용
      maxAge: 1000 * 60 * 60 * 24, // 1일후 쿠키 만료
    },
  })
);

// 정적 파일 제공 설정
const __dirname = path.resolve();
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱
app.use(cookieParser());

// OPTIONS 요청 예외처리
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', `http://${SERVER_URL}:2000`);
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// 디버깅 미들웨어
app.use((req, res, next) => {
  console.log('--- 요청 정보 ---');
  console.log('쿠키:', req.cookies); // 클라이언트에서 전달된 쿠키
  console.log('세션 데이터:', req.session); // 서버에 저장된 세션 정보
  console.log('--- --- ---');
  next(); // 다음 미들웨어로 이동
});

// 라우트 설정
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts/:post_id/comments', commentRoutes);

// JSON 요청 본문 크기 제한 늘리기
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 404 에러 디버깅
app.use((req, res, next) => {
  console.error(`404 Not Found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found' });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('아무 말 대잔치 커뮤니티입니다.');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`BE 서버가 PORT ${PORT} 에서 실행 중입니다.`);
});
