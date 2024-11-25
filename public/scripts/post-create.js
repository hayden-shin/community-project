document.addEventListener('DOMContentLoaded', () => {
  // HTML 요소들
  const title = document.getElementById('post-title');
  const content = document.getElementById('post-content');
  const postButton = document.getElementById('post-button');
  const postHelper = document.getElementById('post-helper');
  const image = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');

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

  // 버튼 상태 업데이트
  const updateButtonState = () => {
    const isTitleFilled = title.value.trim() !== '';
    const isContentFilled = content.value.trim() !== '';

    if (isTitleFilled && isContentFilled) {
      postButton.style.backgroundColor = '#7F6AEE'; // 활성화 색상
      postButton.disabled = false;
    } else {
      postButton.style.backgroundColor = '#ACA0EB'; // 비활성화 색상
      postButton.disabled = true;
    }
  };

  // 초기 버튼 상태 설정
  postButton.disabled = true;
  postButton.style.backgroundColor = '#ACA0EB'; // 초기 비활성화 상태

  // 제목 입력 제한
  title.addEventListener('input', () => {
    if (title.value.length > 26) {
      title.value = title.value.substring(0, 26); // 26자 제한
    }
    updateButtonState();
  });

  // 이미지 업로드 미리보기
  image.addEventListener('change', () => {
    const file = image.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result; // 업로드된 이미지 미리보기
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = ''; // 이미지 없을 경우 초기화
    }
  });

  // 제목과 내용의 실시간 유효성 검사
  [title, content].forEach((input) =>
    input.addEventListener('input', updateButtonState)
  );

  // 게시 버튼 클릭 이벤트
  postButton.addEventListener('click', (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    const isTitleFilled = title.value.trim() !== '';
    const isContentFilled = content.value.trim() !== '';

    if (!isTitleFilled || !isContentFilled) {
      postHelper.textContent = '*제목과 내용을 모두 작성해주세요.';
      postHelper.style.color = 'red';
    } else {
      postHelper.textContent = ''; // 헬퍼 텍스트 초기화
      showToastAndRedirect('게시글이 등록되었습니다!', './post-view');
    }
  });
});
