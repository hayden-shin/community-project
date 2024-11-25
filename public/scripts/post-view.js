document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('back-button');
  const editPostButton = document.getElementById('edit-post-button');
  const deletePostButton = document.getElementById('delete-post-button');
  const likeButton = document.getElementById('like-button');
  const commentInput = document.getElementById('comment-input');
  const commentButton = document.getElementById('comment-button');
  const commentList = document.getElementById('comment-list');
  const postTitle = document.getElementById('post-title');
  const postContent = document.getElementById('post-content');
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');

  let postId = new URLSearchParams(window.location.search).get('id'); // 게시글 ID 가져오기
  let commentsData = [];

  // 유틸리티 함수
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
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

  const toggleButtonState = (button, enabled) => {
    button.disabled = !enabled;
    button.style.backgroundColor = enabled ? '#7F6AEE' : '#ACA0EB';
  };

  const showModal = (message, onConfirm) => {
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    modalConfirmButton.onclick = () => {
      onConfirm();
      closeModal();
    };

    modalCancelButton.onclick = closeModal;
  };

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  const renderPost = (post) => {
    postTitle.textContent = post.title;
    postContent.textContent = post.content;
  };

  const renderComments = () => {
    commentList.innerHTML = ''; // 댓글 초기화
    commentsData.forEach(({ id, content, createdAt, author }) => {
      const commentItem = document.createElement('div');
      commentItem.className = 'comment';

      commentItem.innerHTML = `
        <div class="comment-header">
          <div class="comment-author">
            <img src="../assets/headerpic.png" alt="User Icon" class="author-img">
            <span class="comment-author">${author || '익명'}</span>
            <span class="comment-date">${new Date(createdAt).toLocaleString()}</span>
          </div>
          <div class="comment-buttons">
            <button class="edit-comment-button">수정</button>
            <button class="delete-comment-button">삭제</button>
          </div>
        </div>
        <p class="comment-content">${content}</p>
      `;

      attachCommentEvents(commentItem); // 이벤트 연결
      commentList.appendChild(commentItem); // 댓글 추가
    });
  };

  const addComment = (commentText) => {
    const newComment = {
      id: commentsData.length + 1, // 간단한 ID 생성
      content: commentText,
      createdAt: new Date().toISOString(),
      author: '익명',
    };
    commentsData.push(newComment);
    renderComments(); // 댓글 다시 렌더링
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
        commentsData = commentsData.filter(
          (comment) =>
            comment.id !==
            parseInt(commentItem.querySelector('.comment').dataset.id, 10)
        );
        renderComments();
      });
    });
  };

  const fetchPostAndComments = async () => {
    try {
      // 게시글 데이터 가져오기
      const postResponse = await fetch('/data/posts.json');
      if (!postResponse.ok) {
        throw new Error('Failed to fetch post data');
      }
      const posts = await postResponse.json();
      const post = posts.find((p) => p.id === parseInt(postId, 10));
      if (!post) {
        throw new Error('Post not found');
      }
      renderPost(post);

      // 댓글 데이터 가져오기
      const commentResponse = await fetch('/data/comments.json');
      if (!commentResponse.ok) {
        throw new Error('Failed to fetch comments data');
      }
      commentsData = await commentResponse.json();
      commentsData = commentsData.filter(
        (comment) => comment.postId === parseInt(postId, 10)
      );
      renderComments();
    } catch (error) {
      console.error('Error fetching data:', error);
      showToastAndRedirect('데이터를 불러오는 데 실패했습니다.', './post-list');
    }
  };

  // 이벤트 리스너
  backButton.addEventListener('click', () => window.history.back());

  editPostButton.addEventListener('click', () => {
    window.location.href = `./post-edit?id=${postId}`;
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

  // 초기화
  toggleButtonState(commentButton, false);
  fetchPostAndComments(); // 게시글과 댓글 데이터 가져오기
});
