import { BASE_URL, CDN_URL } from '../config.js';
import { updateCommentCount } from './comment.js';
import { showToast, showModal } from './common.js';
import { formatDateTime, formatNumber } from '../../utils/format.js';
import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

const editPostButton = document.getElementById('edit-post-button');
const deletePostButton = document.getElementById('delete-post-button');
const likeButton = document.getElementById('like-button');

// 버튼 상태 토글 함수
const toggleButtonState = (button, enabled) => {
  button.disabled = !enabled;
  button.style.backgroundColor = enabled ? '#7F6AEE' : '#ACA0EB';
};

// 게시글 조회
async function viewPost(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      renderPost(result.data.post);
      renderComments(result.data.comments);
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('게시글 조회 중 오류:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 게시글 렌더링
async function renderPost(postData) {
  const postTitle = document.getElementById('post-title');
  const postDate = document.getElementById('post-date');
  const postContent = document.getElementById('post-content');
  const userImage = document.getElementById('user-image');
  const postUser = document.getElementById('post-user');
  const image = document.getElementById('post-image');

  const currentUser = await fetchUserProfile();
  const isUser = postData.userId == currentUser.id;

  const editPostButton = document.getElementById('edit-post-button');
  const deletePostButton = document.getElementById('delete-post-button');

  if (isUser) {
    editPostButton.style.display = 'block';
    deletePostButton.style.display = 'block';
  } else {
    editPostButton.style.display = 'none';
    deletePostButton.style.display = 'none';
  }

  postTitle.textContent = postData.title;
  postDate.textContent = postData.updatedAt
    ? formatDateTime(postData.updatedAt)
    : formatDateTime(postData.createdAt);
  postContent.innerHTML = postData.content;

  userImage.src = `${CDN_URL}${postData.url}`;
  postUser.textContent = postData.username;

  if (postData.image) {
    image.src = `${CDN_URL}${postData.image}`;
    image.style.display = 'block';
  } else {
    image.style.display = 'none';
  }

  document.getElementById('like-button').innerHTML =
    `${formatNumber(postData.likeCount)}<span> 좋아요</span>`;
  document.getElementById('view-count').innerHTML =
    `${formatNumber(postData.viewCount)}<span> 조회수</span>`;
  document.getElementById('comment-count').innerHTML =
    `${formatNumber(postData.commentCount)}<span> 댓글</span>`;
}

// 댓글 렌더링
async function renderComments(comments) {
  const commentList = document.getElementById('comment-list');
  const currentUser = await fetchUserProfile();

  commentList.innerHTML = '';

  comments.forEach(async (comment) => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.setAttribute('data-comment-id', comment.id);

    const isUser = comment.userId == currentUser.id;

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-user">
          <img src="${CDN_URL}${comment.url}" alt="User Icon" class="user-img">
          <span class="comment-user">${comment.username}</span>
          <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
        </div>
        <div class="comment-buttons" style="display: ${isUser ? 'flex' : 'none'};">
          <button class="edit-comment-button">수정</button>
          <button class="delete-comment-button">삭제</button>
        </div>
      </div>
      <p class="comment-content">${comment.content}</p>
    `;
    commentList.appendChild(commentElement);
  });
  updateCommentCount();
}

// 게시글 삭제
async function deletePost(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      alert('게시글이 성공적으로 삭제되었습니다.');
      window.location.href = '/post-list';
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('게시글 삭제 중 오류:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 오류 처리
function handleErrors(status, redirectPath) {
  switch (status) {
    case 401:
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
      break;
    case 404:
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = redirectPath;
      break;
    case 500:
      alert('서버 내부 오류가 발생했습니다.');
      break;
    default:
      alert('알 수 없는 오류가 발생했습니다.');
  }
}

// 좋아요 상태 초기화 함수
async function fetchLikeStatus(postId, likeButton) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data.isLiked) {
        likeButton.classList.add('liked');
      } else {
        likeButton.classList.remove('liked');
      }
      return result.data.isLiked;
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('좋아요 상태 조회 중 오류:', error);
  }
}

// 좋아요 추가 함수
async function addLikes(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      likeButton.classList.add('liked');
      document.getElementById('like-button').innerHTML =
        `${formatNumber(result.data.likeCount)}<span> 좋아요</span>`;
      showToast('좋아요가 추가되었습니다.');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('좋아요 추가 중 오류:', error);
  }
}

// 좋아요 제거 함수
async function removeLikes(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      likeButton.classList.remove('liked');
      document.getElementById('like-button').innerHTML =
        `${formatNumber(result.data.likeCount)}<span> 좋아요</span>`;
      showToast('좋아요가 제거되었습니다.');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('좋아요 제거 중 오류:', error);
  }
}

editPostButton.addEventListener('click', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (postId) window.location.href = `/post-edit?id=${postId}`;
});

deletePostButton.addEventListener('click', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (postId) {
    showModal('정말 게시글을 삭제하시겠습니까?', () => {
      deletePost(postId);
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const postId = new URLSearchParams(window.location.search).get('id');

  if (!postId) {
    alert('Post ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  try {
    await viewPost(postId);

    const isLiked = await fetchLikeStatus(postId, likeButton);
    likeButton.addEventListener('click', async () => {
      if (likeButton.classList.contains('liked')) {
        await removeLikes(postId);
      } else {
        await addLikes(postId);
      }
    });
  } catch (error) {
    console.error('초기화 중 오류:', error);
  }
});
