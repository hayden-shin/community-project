import { BASE_URL } from '../config.js';

const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');
const postButton = document.getElementById('post-button');
const postHelper = document.getElementById('post-helper');
const imagePreview = document.getElementById('image-preview');

const checkAllValid = () => {
  return (
    titleInput.value.trim().length > 0 && contentInput.value.trim().length > 0
  );
};

// 제목 입력 제한
titleInput.addEventListener('input', () => {
  if (titleInput.value.length > 26) {
    titleInput.value = titleInput.value.substring(0, 26); // 26자 제한
  }
});

// 이미지 업로드 미리보기
const imageFileInput = document.getElementById('image-url');
imageFileInput.addEventListener('change', () => {
  const file = imageFileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.style.display = 'block';
      imagePreview.src = e.target.result; // 업로드된 이미지 미리보기
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = ''; // 이미지 없을 경우 초기화
    imagePreview.style.display = 'none';
  }
});

// 게시글 작성 요청
async function createPost(title, content, imageFile = null) {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    // 서버 응답 상태 코드 처리
    if (response.status === 201) {
      const result = await response.json();
      console.log(`게시글 생성 응답: ${result.data}`);

      window.location.href = '/post-list';
    } else if (response.status === 400) {
      alert('요청이 잘못되었습니다. 제목 및 내용을 확인해주세요.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('게시글 작성 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

postButton.addEventListener('click', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const imageFile = imageFileInput.files[0];

  createPost(title, content, imageFile);
});

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('input', () => {
    postButton.disabled = !checkAllValid();
    postButton.style.backgroundColor = checkAllValid() ? '#7F6AEE' : '#ACA0EB';
  });
});
