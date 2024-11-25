document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 선택
  const title = document.getElementById('post-title');
  const content = document.getElementById('post-content');
  const image = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');
  const updateButton = document.getElementById('update-post-button');
  const charCountDisplay = document.getElementById('char-count');

  // 상수
  const MAX_TITLE_LENGTH = 26;
  const MAX_CONTENT_LENGTH = 500;

  // 유틸리티 함수
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000); // 3초 후 제거
  };

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

  const updateCharCount = (inputElement, displayElement, maxLength) => {
    const currentLength = inputElement.value.length;
    displayElement.textContent = `${currentLength} / ${maxLength}`;
    displayElement.style.color = currentLength > maxLength ? 'red' : 'green';
  };

  const checkFormValidity = () => {
    const isTitleValid =
      title.value.trim().length > 0 &&
      title.value.trim().length <= MAX_TITLE_LENGTH;
    const isContentValid =
      content.value.trim().length > 0 &&
      content.value.trim().length <= MAX_CONTENT_LENGTH;

    updateButton.disabled = !(isTitleValid && isContentValid);
    updateButton.style.backgroundColor =
      isTitleValid && isContentValid ? '#7F6AEE' : '#ACA0EB';
  };

  // 이벤트 리스너

  // 제목 MAX_TITLE_LENGTH 글자로 제한
  title.addEventListener('input', () => {
    if (title.value.length >= MAX_TITLE_LENGTH) {
      title.value = title.value.slice(0, MAX_TITLE_LENGTH);
      showToast('제목은 최대 26자까지 작성 가능합니다.');
    }
    checkFormValidity();
  });

  // 업로드된 이미지 미리보기
  image.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview.src = reader.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });

  // 폼 유효성에 따라 수정 버튼 활성화/비활성화
  content.addEventListener('input', () => {
    updateCharCount(content, charCountDisplay, MAX_CONTENT_LENGTH);
    checkFormValidity();
  });

  // 폼 제출 (데모용 시뮬레이션)
  updateButton.addEventListener('click', () => {
    showToastAndRedirect(
      '게시글이 성공적으로 수정되었습니다!',
      `/post-view?{id}`
    );
  });

  // 폼 상태 초기화
  checkFormValidity();
  updateCharCount(content, charCountDisplay, MAX_CONTENT_LENGTH);
});
