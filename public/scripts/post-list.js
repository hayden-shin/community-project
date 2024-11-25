document.addEventListener('DOMContentLoaded', () => {
  // 게시글 작성 버튼
  const createPostButton = document.getElementById('create-post-button');

  // 게시글 목록 컨테이너
  const postList = document.querySelector('post-list');

  // 게시글 임시 데이터
  const postsData = [
    {
      id: 1,
      title: '게시글 제목 1',
      content: '게시글 내용입니다.',
      createdAt: new Date(),
      views: 1050,
      comments: 15,
      likes: 12000,
    },
    {
      id: 2,
      title: '게시글 제목이 굉장히 길어서 잘려야만 보이는 예시입니다람쥐방울',
      content: '이 게시글의 본문 내용입니다.',
      createdAt: new Date(),
      views: 999,
      comments: 8,
      likes: 500,
    },
  ];

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 지정된 시간 후 토스트 메시지 제거 및 페이지 이동
    setTimeout(() => {
      toast.remove(); // 토스트 메시지 제거
      window.location.href = url; // 페이지 이동
    }, duration);
  };

  // 날짜 및 시간 포맷 함수
  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // 숫자 축약 함수 (1k, 10k, 100k)
  const formatNumber = (number) => {
    if (number >= 100000) return `${Math.floor(number / 1000)}k`;
    if (number >= 10000) return `${Math.floor(number / 1000)}k`;
    if (number >= 1000) return `${Math.floor(number / 1000)}k`;
    return number;
  };

  // 게시글 렌더링 함수
  const renderPosts = () => {
    // 게시글 목록 초기화
    postList.innerHTML = '';

    postsData.forEach(({ id, title, createdAt, views, comments, likes }) => {
      // 게시글 요소 생성
      const postItem = document.createElement('div');
      postItem.classList.add('post-item');
      postItem.dataset.id = id; // 게시글 ID 저장

      // 제목이 26자로 제한
      const truncatedTitle =
        title.length > 26 ? `${title.substring(0, 26)}...` : title;

      // 게시글 아이템 생성
      postItem.innerHTML = `
        <h3 class="post-title">${truncatedTitle}</h3>
        <div class="post-stats">
          <span>조회수: ${formatNumber(views)}</span>
          <span>댓글: ${formatNumber(comments)}</span>
          <span>좋아요: ${formatNumber(likes)}</span>
          <p class="post-date">${formatDateTime(createdAt)}</p>
        </div>
        <hr />
        <div class="post-author">
          <img src="../assets/headerpic.png" alt="프로필 이미지" class="post-author-img">
          <span>더미 작성자 1</span>
        </div>
      `;

      // 게시글 클릭 시 게시글 상세 페이지로 이동
      postItem.addEventListener('click', () => {
        window.location.href = `./post-view?id=${id}`;
      });

      // 게시글 목록 컨테이너에 추가
      postList.appendChild(postItem);
    });
  };

  // 게시글 작성 페이지로 이동 이벤트
  createPostButton.addEventListener('click', () => {
    showToastAndRedirect('게시글 작성 페이지로 이동합니다.', './post-create');
  });

  // 초기 게시글 렌더링
  renderPosts();
});
