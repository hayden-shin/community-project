## 커뮤니티 프로젝트 백엔드 🚀

이 저장소는 커뮤니티 프로젝트의 백엔드 코드베이스로, 비즈니스 로직, 데이터베이스 작업 및 API 엔드포인트를 처리합니다. Node.js와 MariaDB로 제작되었습니다.

---

### 주요 기능 ✨

- 📝 게시물과 댓글에 대한 CRUD 작업을 위한 RESTful API
- 🔒 사용자 인증 및 세션 관리
- 📤 이미지 업로드를 포함한 프로필 관리
- ⚙️ 데이터 일관성을 위한 트랜잭션 처리
- 🔐 보안 비밀번호 해싱 및 데이터 유효성 검사

---

### 기술 스택 🛠️

- ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) **Node.js**: 서버사이드 런타임
- ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) **Express**: 웹 프레임워크
- ![MariaDB](https://img.shields.io/badge/-MariaDB-003545?logo=mariadb&logoColor=white) **MariaDB**: 데이터베이스
- ![bcrypt](https://img.shields.io/badge/-bcrypt-orange?logo=lock&logoColor=white) **bcrypt**: 비밀번호 해싱
- ![Multer](https://img.shields.io/badge/-Multer-blue?logo=upload&logoColor=white) **Multer**: 파일 업로드

---

### 설치 방법 🖥️

1. 저장소를 클론합니다:

   ```bash
   git clone https://github.com/100-hours-a-week/2-hayden-shin-community-be.git
   cd backend
   ```

2. 의존성을 설치합니다:

   ```bash
   npm install
   ```

3. 루트 디렉토리에 `.env` 파일을 생성합니다:

   ```plaintext
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_DATABASE=community
   SESSION_SECRET=yoursecret
   ```

4. 서버를 시작합니다:

   ```bash
   npm start
   ```

---

### 파일 구조 📂

```plaintext
├── controller/
│   ├── post.js
│   ├── comment.js
│   ├── auth.js
├── model/
│   ├── post.js
│   ├── comment.js
│   ├── auth.js
├── router/
│   ├── post.js
│   ├── comment.js
│   ├── auth.js
├── db/
│   └── database.js
```

---

### API 엔드포인트 🌐

#### **인증(Authentication)** 🔑
- **POST /auth/signup**: 새로운 사용자 생성
- **POST /auth/login**: 사용자 로그인
- **POST /auth/logout**: 현재 사용자 로그아웃

#### **게시물(Posts)** 📝
- **GET /posts**: 모든 게시물 조회
- **GET /posts/:post_id**: 특정 게시물 조회
- **POST /posts**: 새 게시물 생성
- **PATCH /posts/:post_id**: 게시물 수정
- **DELETE /posts/:post_id**: 게시물 삭제

#### **댓글(Comments)** 💬
- **GET /posts/:post_id/comments**: 특정 게시물의 모든 댓글 조회
- **POST /posts/:post_id/comments**: 특정 게시물에 댓글 추가
- **PATCH /comments/:comment_id**: 댓글 수정
- **DELETE /comments/:comment_id**: 댓글 삭제

---

### 데이터베이스 스키마 🗄️

#### **사용자(Users)** 👤
- id, username, email, password, profileImage, createdAt

#### **게시물(Posts)** 📝
- id, title, content, image, userId, likeCount, viewCount, commentCount, createdAt, updatedAt

#### **댓글(Comments)** 💬
- id, postId, content, userId, createdAt, updatedAt

#### **좋아요(Likes)** ❤️
- id, postId, userId, createdAt

---

### 기여 방법 🤝

1. 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다:

   ```bash
   git checkout -b feature-name
   ```

3. 변경 사항을 커밋합니다:

   ```bash
   git commit -m "feat: add feature"
   ```

4. 브랜치를 푸시합니다:

   ```bash
   git push origin feature-name
   ```

5. 풀 리퀘스트를 생성합니다.

---

### 라이선스 📜

이 프로젝트는 MIT 라이선스를 따릅니다.
