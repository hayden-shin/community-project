import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'assets'; // 파일을 assets/에 저장
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // 경로가 없으면 생성
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname); // 파일 확장자 추출
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // 고유한 파일 이름 생성
  },
});

// 파일 필터 설정
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; // 허용된 MIME 타입
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // 허용된 파일
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'), false); // 에러 처리
  }
};

// 업로드 미들웨어
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image'); // 필드 이름 'image'
