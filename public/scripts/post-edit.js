document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('post-title');
  const content = document.getElementById('post-content');
  const image = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');
  const updateButton = document.getElementById('update-post-button');
  const charCountDisplay = document.getElementById('char-count');

  // 상수
  const MAX_TITLE_LENGTH = 26;
  const MAX_CONTENT_LENGTH = 500;

  let post = null;

  // 유틸리티 함수
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000); // 2초 후 제거
  };

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

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
    const isTitleFilled =
      title.value.trim().length > 0 &&
      title.value.trim().length <= MAX_TITLE_LENGTH;
    const isContentFilled =
      content.value.trim().length > 0 &&
      content.value.trim().length <= MAX_CONTENT_LENGTH;

    updateButton.disabled = !(isTitleFilled && isContentFilled);
    updateButton.style.backgroundColor =
      isTitleFilled && isContentFklled ? '#7F6AEE' : '#ACA0EB';
  };

  // 게시글 데이터 가져오기
  const fetchPostData = async () => {
    try {
      const response = await fetch('/data/posts.json');
      if (!response.ok) {
        throw new Error('Failed to fetch posts data');
      }
      const posts = await response.json();

      // 예제에서는 ID를 1로 설정 (실제 구현에서는 URL의 쿼리스트링에서 ID를 가져옴)
      const postId = 1;
      post = posts.find((p) => p.id === postId);

      if (!post) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      // 기존 게시글 데이터로 폼 채우기
      title.value = post.title;
      content.value = post.content;
      if (post.image) {
        imagePreview.src = post.image;
        imagePreview.style.display = 'block';
      } else {
        imagePreview.style.display = 'none';
      }

      updateCharCount(content, charCountDisplay, MAX_CONTENT_LENGTH);
      checkFormValidity();
    } catch (error) {
      console.error('Error fetching post data:', error);
      showToast('게시글 데이터를 불러오는 데 실패했습니다.');
    }
  };

  // 게시글 업데이트 시뮬레이션
  const updatePost = async () => {
    try {
      // 수정된 게시글 데이터 준비
      const updatedPost = {
        ...post,
        title: title.value.trim(),
        content: content.value.trim(),
        image: imagePreview.src || '', // 이미지 URL
        updatedAt: new Date().toISOString(),
      };

      console.log('Updated post:', updatedPost); // 서버 저장 시뮬레이션
      showToastAndRedirect(
        '게시글이 성공적으로 수정되었습니다!',
        './post-view'
      );
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('게시글 수정에 실패했습니다.');
    }
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
  updateButton.addEventListener('click', async () => {
    await updatePost();
  });

  // 초기화
  fetchPostData(); // 기존 게시글 데이터 가져오기
  checkFormValidity();
});
