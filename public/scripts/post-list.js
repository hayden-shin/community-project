document.addEventListener('DOMContentLoaded', () => {
  // 게시글 작성 버튼
  const createPostButton = document.getElementById('create-post-button');

  // 게시글 목록 컨테이너
  const postList = document.querySelector('.post-list');

  // 게시글 데이터 저장 변수
  let postsData = [];

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      window.location.href = url;
    }, duration);
  };

  // 날짜 및 시간 포맷 함수
  const formatDateTime = (date) => {
    const dateObj = new Date(date); // 날짜 문자열을 Date 객체로 변환
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');
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

  // 게시글 데이터 가져오기
  const fetchPosts = async () => {
    try {
      const response = await fetch('/data/posts.json');
      if (!response.ok) {
        throw new Error('Failed to fetch posts data');
      }
      postsData = await response.json();
      renderPosts(); // 데이터를 가져온 후 게시글 렌더링
    } catch (error) {
      console.error('Error fetching posts data:', error);
      showToastAndRedirect(
        '게시글 데이터를 불러오는 데 실패했습니다.',
        './error'
      );
    }
  };

  // 게시글 작성 페이지로 이동 이벤트
  createPostButton.addEventListener('click', () => {
    showToastAndRedirect('게시글 작성 페이지로 이동합니다.', './post-create');
  });

  // 초기 데이터 가져오기
  fetchPosts();
});
