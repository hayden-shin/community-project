import express from 'express';
import path from 'path';

const app = express();

// 현재 디렉토리 설정
const __dirname = path.resolve();

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

const pagesDir = path.join(__dirname, 'public/pages');

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(pagesDir, `${page}.html`);

  // 파일 존재 여부 확인
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send(`File not found: ${filePath}`);
    }
  });
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
