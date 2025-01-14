## 커뮤니티 프로젝트 프론트엔드 🚀

이 저장소는 커뮤니티 프로젝트의 프론트엔드 코드베이스로, 사용자 인터페이스와 상호작용을 담당합니다. HTML, CSS, JavaScript를 사용하여 제작되었습니다.

---

### 주요 기능 ✨

- 🔒 **사용자 인증** (로그인, 회원가입, 로그아웃)
- 📝 **게시물 생성, 조회, 수정, 삭제 (CRUD)**
- ❤️ **게시물 상호작용** (좋아요, 댓글)
- 📱 **반응형 디자인** (데스크톱 및 모바일 최적화)
- 👤 **프로필 관리** (프로필 이미지 업로드 포함)

---

### 기술 스택 🛠️

- ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) **HTML5**: 마크업 구조
- ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) **CSS3**: 스타일링 및 반응형 디자인
- ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) **바닐라 JavaScript (ES6)**: 상호작용 및 API 통합

---

### 설치 방법 🖥️

1. 저장소를 클론합니다:

   ```bash
   git clone https://github.com/100-hours-a-week/2-hayden-shin-community-fe.git
   cd frontend
   ```

2. 프로젝트를 로컬에서 실행합니다:

   ```bash
   npm install
   npm start
   ```

   그런 다음 브라우저에서 아래 주소로 접속합니다:
   ```
   http://127.0.0.1:2000
   ```

---

### 파일 구조 📂

```plaintext
├── assets/
├── css/
│   ├── signup.css
│   ├── post-list.css
│   ├── profile-update.css
├── js/
│   ├── app.js
│   ├── post-create.js
│   ├── post-view.js
│   ├── login.js
│   ├── signup.js
│   ├── dropdown.js
```

---

### API 통합 🌐

프론트엔드는 RESTful API를 통해 백엔드와 통신합니다:

- **인증(Authentication)**: `/auth/signup`, `/auth/login`, `/auth/logout`
- **게시물(Posts)**: `/posts`, `/posts/:post_id`
- **댓글(Comments)**: `/posts/:post_id/comments`
- **프로필(Profile)**: `/auth/profile`

---

### 기여 방법 🤝

1. 저장소를 포크합니다.
2. 새로운 브랜치를 생성합니다:
   ```bash
   git checkout -b feature-name
   ```
3. 변경 사항을 커밋합니다:
   ```bash
   git commit -m "Add feature"
   ```
4. 브랜치를 푸시합니다:
   ```bash
   git push origin feature-name
   ```
5. 풀 리퀘스트를 생성합니다.
