import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();

// 현재 디렉토리 설정
const __dirname = path.resolve();

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

// Dynamic routing for HTML files in public/pages
const pagesDir = path.join(__dirname, 'public/pages');
fs.readdirSync(pagesDir).forEach((file) => {
  if (file.endsWith('.html')) {
    const route = `/${file.replace('.html', '')}`;
    app.get(route, (req, res) => {
      res.sendFile(path.join(pagesDir, file));
    });
  }
});

// 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
