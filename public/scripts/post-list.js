import BASE_URL from '../config.js';
import { formatDateTime, formatNumber } from '../../utils/format.js';

// 게시글 리스트 새로고침
export const refreshPostList = async () => {
  await postList();
  console.log('게시글 요소값 변경 후 게시글 리스트 새로고침');
};

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

// 게시글 렌더링 함수
const renderPosts = (postsData) => {
  const postListContainer = document.getElementById('post-list-container');

  if (!postListContainer) {
    console.error('게시글이 없습니다.');
    return;
  }

  postListContainer.innerHTML = '';

  // 게시글 데이터 순회 및 렌더링
  postsData.forEach(
    ({
      id,
      title,
      text,
      author_id,
      author_profile_url = '/assets/default-profile.jpg',
      author_nickname,
      created_at,
      likes,
      views,
      comments,
    }) => {
      // 게시글 요소 생성
      const postItem = document.createElement('div');
      postItem.classList.add('post-item');
      postItem.dataset.id = id; // 게시글 ID 저장

      // 게시글 아이템 HTML 구조 생성
      postItem.innerHTML = `
        <h3 class="post-title">${title}</h3>
        <div class="post-stats">
          <span>조회수: ${formatNumber(views)}</span>
          <span>댓글: ${formatNumber(comments)}</span>
          <span>좋아요: ${formatNumber(likes)}</span>
          <p class="post-date">${formatDateTime(created_at)}</p>
        </div>
        <hr />
        <div class="post-author">
          <img src="${author_profile_url}" alt="프로필 이미지" class="post-author-img">
          <span>${author_nickname}</span>
        </div>
      `;

      postItem.addEventListener('click', () => {
        window.location.href = `/post-view?id=${id}`;
      });

      postListContainer.prepend(postItem);
    }
  );
};

// 게시글 리스트
async function postList() {
  try {
    // API 호출: 게시글 목록 요청
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // 서버 응답 상태 코드 처리
    if (response.status === 200) {
      const result = await response.json();
      console.log('Fetched posts:', result.data); // 디버그 로그
      renderPosts(result.data); // 게시글 데이터를 화면에 렌더링
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 리다이렉트
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('게시글 목록 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 게시글 로딩
document.addEventListener('DOMContentLoaded', () => {
  const createPostButton = document.getElementById('create-post-button');
  if (createPostButton) {
    createPostButton.addEventListener('click', () => {
      showToastAndRedirect('게시글 작성 페이지로 이동합니다.', '/post-create');
    });
  }

  postList();
});
