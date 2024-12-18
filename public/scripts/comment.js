import { showModal, showToast } from './common.js';
import { formatDateTime } from '../../utils/format.js';

const SERVER_URL = 'http://3.38.209.206:3000';

export const updateCommentCount = (postId) => {
  const commentList = document.getElementById(`comment-list`);
  const commentCountElement = document.getElementById(`comment-count`);

  if (!commentList || !commentCountElement) {
    console.warn('아직 작성된 댓글이 없습니다.');
    return;
  }

  commentCountElement.innerHTML = `${commentList.childElementCount}<span>댓글</span>`;
};

// 댓글 등록 요청
const createComment = async (postId) => {
  const commentInput = document.getElementById('comment-input');
  const commentText = commentInput.value.trim();

  if (!commentText) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: commentText }),
      }
    );

    if (response.status === 201) {
      const result = await response.json();

      console.log('등록한 댓글: ', result.data);

      renderComment(result.data);
      updateCommentCount(postId);
      // refreshPostList();
      commentInput.value = '';
      alert('댓글이 성공적으로 등록되었습니다.');
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다.');
      window.location.href = '/login';
    } else if (response.status === 400) {
      alert('잘못된 요청입니다. 댓글 내용을 확인해주세요.');
    } else if (response.status === 429) {
      alert('댓글 등록이 너무 빈번합니다. 잠시 후 다시 시도해주세요.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('댓글 등록 실패:', error);
    alert('서버와의 연결에 실패했습니다.');
  }
};

const renderComment = (commentData) => {
  const commentList = document.getElementById(`comment-list`);

  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');
  commentElement.setAttribute('data-comment-id', commentData.comment_id);

  // 절대경로로 프로필 이미지 설정
  const profileImageUrl = commentData.author_profile_url
    ? `${SERVER_URL}${commentData.author_profile_url}`
    : `${SERVER_URL}/assets/default-profile.jpg`;

  commentElement.innerHTML = `
    <div class="comment-header">
      <div class="comment-author">
        <img src="${profileImageUrl}" alt="User Icon" class="author-img">
        <span class="comment-author">${commentData.author_nickname}</span>
        <span class="comment-date">${formatDateTime(commentData.created_at)}</span>
      </div>
      <div class="comment-buttons">
        <button class="edit-comment-button">수정</button>
        <button class="delete-comment-button">삭제</button>
      </div>
    </div>
    <p class="comment-text">${commentData.text}</p>
  `;

  commentList.appendChild(commentElement);
  updateCommentCount();
};

// 댓글 수정
const editComment = async (postId, commentId, newText) => {
  // 버튼 텍스트 변경
  // commentButton.textContent = '댓글 수정';
  // commentButton.style.backgroundColor = ''; // 기본 색상 복구
  // commentInput.value = existingContent;

  try {
    // 댓글 수정 요청
    const response = await fetch(
      `${SERVER_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          comment_id: commentId,
          text: newText,
        }),
        credentials: 'include',
      }
    );

    if (response.status === 200 || response.status === 204) {
      const result = await response.json();

      alert('댓글이 성공적으로 수정되었습니다.');

      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"] .comment-text`
      );
      if (commentElement) {
        commentElement.textContent = newText;
      }
    } else if (response.status === 400) {
      alert('잘못된 요청입니다. 입력값을 확인해주세요.');
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    } else if (response.status === 403) {
      alert('이 댓글을 수정할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('수정하려는 댓글을 찾을 수 없습니다.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('댓글 수정 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다.');
  }
};

// 댓글 삭제 요청
const deleteComment = async (postId, commentId) => {
  try {
    const response = await fetch(
      `${SERVER_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (response.status === 204) {
      showToast('댓글이 성공적으로 삭제되었습니다.');

      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"]`
      );
      if (commentElement) {
        commentElement.remove(); // 댓글 DOM 요소 삭제
      }
      updateCommentCount();
      // refreshPostList();
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    } else if (response.status === 403) {
      alert('이 댓글을 삭제할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('삭제하려는 댓글을 찾을 수 없습니다.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('댓글 삭제 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    return;
  }

  try {
    const response = await fetch(
      `${SERVER_URL}/posts/${postId}/comments`
    );
    if (!response.ok) {
      throw new Error('댓글 데이터를 가져올 수 없습니다.');
    }

    const { data: comments } = await response.json();
    const commentList = document.getElementById('comment-list');

    commentList.innerHTML = ''; // 기존 댓글 제거
    comments.forEach((comment) => {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `
        <p>${comment.author_nickname}: ${comment.text}</p>
        <small>${new Date(comment.created_at).toLocaleString()}</small>
      `;
      commentList.appendChild(commentElement);
    });
  } catch (error) {
    console.error('댓글 로드 실패:', error);
  }

  const commentList = document.getElementById('comment-list');
  const commentInput = document.getElementById('comment-input');
  const commentButton = document.getElementById('comment-button');
  let isEditMode;

  // 댓글 수정 버튼 처리
  commentList.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-comment-button')) {
      const commentElement = event.target.closest('.comment');
      const commentId = commentElement.dataset.commentId;
      const existingContent = commentElement
        .querySelector('.comment-text')
        .textContent.trim();

      commentInput.value = existingContent;
      commentButton.textContent = '댓글 수정';
      commentButton.dataset.commentId = commentId;
      isEditMode = true;
    }
  });

  // 댓글 등록 및 수정 처리
  commentButton.addEventListener('click', async () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    const text = commentInput.value.trim();

    if (!text) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (isEditMode) {
      const commentId = commentButton.dataset.commentId;
      await editComment(postId, commentId, text);
      isEditMode = false;
      commentButton.textContent = '댓글 작성';
      commentButton.removeAttribute('data-comment-id');
    } else {
      await createComment(postId);
    }

    commentInput.value = '';
  });

  // 댓글 삭제 버튼 처리
  commentList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-comment-button')) {
      const commentElement = event.target.closest('.comment');
      const commentId = commentElement.dataset.commentId;
      const postId = new URLSearchParams(window.location.search).get('id');

      if (!postId || !commentId) {
        alert('게시글 또는 댓글 정보를 확인할 수 없습니다.');
        return;
      }

      showModal('정말 댓글을 삭제하시겠습니까?', () => {
        deleteComment(postId, commentId);
      });
    }
  });
});
