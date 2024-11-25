document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소
  const backButton = document.getElementById('back-button');
  const editPostButton = document.getElementById('edit-post-button');
  const deletePostButton = document.getElementById('delete-post-button');
  const likeButton = document.getElementById('like-button');
  const commentInput = document.getElementById('comment-input');
  const commentButton = document.getElementById('comment-button');
  const commentList = document.getElementById('comment-list');
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');

  // 유틸리티 함수
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000); // 3초 후 제거
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

  const toggleButtonState = (button, enabled) => {
    button.disabled = !enabled;
    button.style.backgroundColor = enabled ? '#7F6AEE' : '#ACA0EB';
  };

  const showModal = (message, onConfirm) => {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 스크롤 비활성화

    modalConfirmButton.onclick = () => {
      onConfirm();
      closeModal();
    };

    modalCancelButton.onclick = closeModal;
  };

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // 스크롤 복구
  };

  const addComment = (commentText) => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment';
    const currentTime = new Date().toLocaleString();

    commentItem.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <img src="../assets/headerpic.png" alt="User Icon" class="author-img">
          <span class="comment-author">익명</span>
          <span class="comment-date">${currentTime}</span>
        </div>
        <div class="comment-buttons">
          <button class="edit-comment-button">수정</button>
          <button class="delete-comment-button">삭제</button>
        </div>
      </div>
      <p class="comment-content">${commentText}</p>
    `;

    commentList.appendChild(commentItem);
    attachCommentEvents(commentItem);
  };

  const attachCommentEvents = (commentItem) => {
    const editButton = commentItem.querySelector('.edit-comment-button');
    const deleteButton = commentItem.querySelector('.delete-comment-button');

    editButton.addEventListener('click', () => {
      const commentContent = commentItem.querySelector('.comment-content');
      commentInput.value = commentContent.textContent;
      commentButton.textContent = '댓글 수정';
      toggleButtonState(commentButton, true);

      commentButton.onclick = () => {
        commentContent.textContent = commentInput.value.trim();
        commentButton.textContent = '댓글 등록';
        commentInput.value = '';
        toggleButtonState(commentButton, false);
        commentButton.onclick = null;
      };
    });

    deleteButton.addEventListener('click', () => {
      showModal('정말 댓글을 삭제하시겠습니까?', () => {
        commentItem.remove();
      });
    });
  };

  // 이벤트 리스너
  backButton.addEventListener('click', () => window.history.back());

  editPostButton.addEventListener('click', () => {
    window.location.href = './post-edit';
  });

  deletePostButton.addEventListener('click', () => {
    showModal('정말 게시글을 삭제하시겠습니까?', () => {
      showToastAndRedirect('게시글이 삭제되었습니다.', './post-list');
    });
  });

  likeButton.addEventListener('click', () => {
    likeButton.classList.toggle('liked');
    showToast('좋아요를 눌렀습니다.');
  });

  commentInput.addEventListener('input', () => {
    toggleButtonState(commentButton, commentInput.value.trim().length > 0);
  });

  commentButton.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    if (!commentText) return;
    addComment(commentText);
    commentInput.value = '';
    toggleButtonState(commentButton, false);
  });

  // 버튼 상태 초기화
  toggleButtonState(commentButton, false);
});
