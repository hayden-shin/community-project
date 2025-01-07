import BASE_URL from '../config.js';
import { showToast } from './common.js';

const title = document.getElementById('post-title');
const content = document.getElementById('post-content');
const imageInput = document.getElementById('image-url');
const imagePreview = document.getElementById('image-preview');
const updateButton = document.getElementById('update-post-button');
const charCountDisplay = document.getElementById('char-count');

const MAX_TITLE_LENGTH = 26;

document.addEventListener('DOMContentLoaded', async () => {
  const postId = new URLSearchParams(window.location.search).get('id');

  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  try {
    // 기존 게시글 데이터 가져오기
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('게시글 데이터를 불러올 수 없습니다.');
    }

    const result = await response.json();
    const post = result.data.post;

    // 기존 데이터 세팅
    title.value = post.title;
    content.value = post.content;

    if (post.postImage) {
      imagePreview.src = `${BASE_URL}${post.postImage}`;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }

    updateButtonState();
  } catch (error) {
    console.error('게시글 데이터 로드 실패:', error);
    alert('게시글 데이터를 불러오는 중 문제가 발생했습니다.');
  }

  // 제목 글자 수 제한 처리
  title.addEventListener('input', () => {
    if (title.value.length > MAX_TITLE_LENGTH) {
      title.value = title.value.slice(0, MAX_TITLE_LENGTH);
      showToast('제목은 최대 26자까지 작성 가능합니다.');
    }
    updateButtonState();
  });

  // 이미지 업로드 미리보기 처리
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result; // 업로드된 이미지 미리보기
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = ''; // 이미지 없을 경우 초기화
      imagePreview.style.display = 'none';
    }
  });

  // 수정 버튼 클릭 처리
  updateButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const newTitle = title.value.trim();
    const newContent = content.value.trim();
    const newPostImage = imageInput.files[0];

    if (!newTitle || !newContent) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    await editPost(postId, newTitle, newContent, newPostImage);
  });

  // 초기 버튼 상태 설정
  updateButtonState();
});

// 게시글 수정 요청 함수
async function editPost(postId, newTitle, newText, newPostImage = null) {
  const formData = new FormData();
  formData.append('title', newTitle);
  formData.append('content', newText);
  if (newPostImage) formData.append('image', newPostImage);

  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });

    if (response.ok) {
      showToast('게시글이 성공적으로 수정되었습니다.');
      setTimeout(() => {
        window.location.href = `/post-view?id=${postId}`;
      }, 2000);
    } else {
      alert('게시글 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('게시글 수정 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 수정 버튼 활성화/비활성화 상태 업데이트
function updateButtonState() {
  const isValid =
    title.value.trim().length > 0 &&
    title.value.trim().length <= MAX_TITLE_LENGTH &&
    content.value.trim().length > 0;

  updateButton.disabled = !isValid;
  updateButton.style.backgroundColor = isValid ? '#7F6AEE' : '#ACA0EB';
}
