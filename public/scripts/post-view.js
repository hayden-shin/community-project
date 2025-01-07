import BASE_URL from '../config.js';
import { updateCommentCount } from './comment.js';
import { showToast, showModal } from './common.js';
import { formatDateTime, formatNumber } from '../../utils/format.js';
import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

const backButton = document.getElementById('back-button');
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
  const authorImage = document.getElementById('author-image');
  const postAuthor = document.getElementById('post-author');
  const postImage = document.getElementById('post-image');

  const currentUser = await fetchUserProfile();
  const isAuthor = postData.author.id == currentUser.id;

  const editPostButton = document.getElementById('edit-post-button');
  const deletePostButton = document.getElementById('delete-post-button');

  if (isAuthor) {
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

  authorImage.src = `${BASE_URL}${postData.author.profileImage}`;
  postAuthor.textContent = postData.author.nickname;

  if (postData.postImage) {
    postImage.src = `${BASE_URL}${postData.postImage}`;
    postImage.style.display = 'block';
  } else {
    postImage.style.display = 'none';
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

    const isAuthor = comment.author.id == currentUser.id;

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <img src="${BASE_URL}${comment.author.profileImage}" alt="User Icon" class="author-img">
          <span class="comment-author">${comment.author.nickname}</span>
          <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
        </div>
        <div class="comment-buttons" style="display: ${isAuthor ? 'flex' : 'none'};">
          <button class="edit-comment-button">수정</button>
          <button class="delete-comment-button">삭제</button>
        </div>
      </div>
      <p class="comment-text">${comment.content}</p>
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

// 초기화
backButton.addEventListener('click', () => window.history.back());

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

// import BASE_URL from '../config.js';
// import { updateCommentCount } from './comment.js';
// import { showToast, showModal } from './common.js';
// import { formatDateTime, formatNumber } from '../../utils/format.js';
// import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

// const backButton = document.getElementById('back-button');
// const editPostButton = document.getElementById('edit-post-button');
// const deletePostButton = document.getElementById('delete-post-button');

// const postTitle = document.getElementById('post-title');
// const postText = document.getElementById('post-text');

// const toggleButtonState = (button, enabled) => {
//   button.disabled = !enabled;
//   button.style.backgroundColor = enabled ? '#7F6AEE' : '#ACA0EB';
// };

// // 게시글 조회
// async function viewPost(postId) {
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${postId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     });

//     if (response.status === 200) {
//       const result = await response.json();
//       renderPost(result.data.post);
//       renderComments(result.data.comments);
//     } else if (response.status === 401) {
//       alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
//       window.location.href = '/login';
//     } else if (response.status === 404) {
//       alert('게시글을 찾을 수 없습니다.');
//       window.location.href = '/post-list';
//     } else if (response.status === 500) {
//       alert('서버 내부 오류가 발생했습니다.');
//     } else {
//       alert('알 수 없는 오류가 발생했습니다.');
//     }
//   } catch (error) {
//     console.error(error);
//     alert('서버와의 연결에 실패했습니다.');
//   }
// }

// async function renderPost(postData) {
//   document.getElementById('post-title').textContent = postData.title;
//   document.getElementById('post-date').textContent = formatDateTime(
//     postData.createdAt
//   );
//   document.getElementById('post-content').innerHTML = postData.content;

//   console.log('Post Data:', postData); // postData 확인

//   // 작성자 프로필 정보 가져오기
//   const authorImage = document.getElementById('author-image');
//   const postAuthor = document.getElementById('post-author');

//   const author = postData.author;
//   authorImage.src = `${BASE_URL}${author.profileImage}`;
//   postAuthor.textContent = author.nickname;

//   // 게시글 이미지 렌더링
//   const postImage = document.getElementById('post-image');
//   if (postData.postImage) {
//     postImage.src = `${BASE_URL}${postData.postImage}`;
//     postImage.style.display = 'block';
//   } else {
//     postImage.style.display = 'none';
//   }

//   // 좋아요, 조회수, 댓글 수 업데이트
//   document.getElementById('like-button').innerHTML =
//     `${formatNumber(postData.likeCount)}<span>좋아요</span>`;
//   document.getElementById('view-count').innerHTML =
//     `${formatNumber(postData.viewCount)}<span>조회수</span>`;
//   document.getElementById('comment-count').innerHTML =
//     `${formatNumber(postData.commentCount)}<span>댓글</span>`;
// }

// async function renderComments(comments) {
//   const commentList = document.getElementById('comment-list');
//   commentList.innerHTML = ''; // 기존 내용을 초기화

//   for (const comment of comments) {
//     const commentElement = document.createElement('div');
//     commentElement.classList.add('comment');
//     commentElement.setAttribute('data-comment-id', comment.id);

//     // 댓글 작성자 프로필 정보 가져오기
//     const author = await fetchUserProfile(comment.author.id);

//     commentElement.innerHTML = `
//         <div class="comment-header">
//           <div class="comment-author">
//             <img src="${author.profileImage}" alt="User Icon" class="author-img">
//             <span class="comment-author">${author.nickname}</span>
//             <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
//           </div>
//           <div class="comment-buttons">
//             <button class="edit-comment-button">수정</button>
//             <button class="delete-comment-button">삭제</button>
//           </div>
//         </div>
//         <p class="comment-text">${comment.content}</p>
//       `;

//     commentList.appendChild(commentElement);
//   }
//   updateCommentCount();
// }

// // 게시글 삭제
// async function deletePost(postId) {
//   console.log('삭제할 게시글 ID: ', postId);
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${postId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     });

//     if (response.status === 204) {
//       alert('게시글이 성공적으로 삭제되었습니다.');
//       window.location.href = '/post-list';
//     } else if (response.status === 401) {
//       alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
//       window.location.href = '/login';
//     } else if (response.status === 403) {
//       alert('이 게시글을 삭제할 권한이 없습니다.');
//     } else if (response.status === 404) {
//       alert('삭제하려는 게시글을 찾을 수 없습니다.');
//       window.location.href = '/post-list';
//     } else if (response.status === 500) {
//       alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
//     } else {
//       alert('알 수 없는 오류가 발생했습니다.');
//     }
//   } catch (error) {
//     console.error('게시글 삭제 요청 실패:', error);
//     alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
//   }
// }

// const likeButton = document.getElementById('like-button');

// export async function fetchLikeStatus(postId, likeButton) {
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
//       method: 'GET',
//       credentials: 'include',
//     });

//     if (response.ok) {
//       const result = await response.json();
//       const { isLiked } = result.data;

//       // 서버 상태에 맞게 초기 UI 설정
//       if (isLiked) {
//         likeButton.classList.add('liked');
//       } else {
//         likeButton.classList.remove('liked');
//       }

//       return isLiked;
//     } else if (response.status === 401) {
//       alert('로그인이 필요합니다.');
//       window.location.href = '/login';
//     } else {
//       console.error('좋아요 상태를 가져올 수 없습니다.');
//     }
//   } catch (error) {
//     console.error('좋아요 상태 가져오기 실패:', error);
//   }
//   return false; // 기본값
// }

// async function addLikes(postId) {
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
//       method: 'POST',
//       credentials: 'include',
//     });

//     if (response.ok) {
//       const result = await response.json();
//       const { likeCount } = result.data;

//       // likeButton.classList.add('liked');
//       likeButton.innerHTML = `${likeCount}<span>좋아요</span>`;
//       showToast('좋아요');
//     } else if (response.status == 401) {
//       alert('로그인이 필요합니다.');
//       window.location.href = '/login';
//     } else {
//       alert('좋아요 요청 실패');
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function removeLikes(postId) {
//   try {
//     const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
//       method: 'DELETE',
//       credentials: 'include',
//     });

//     if (response.ok) {
//       const result = await response.json();
//       const { likeCount } = result.data;

//       // likeButton.classList.remove('liked');
//       likeButton.innerHTML = `${likeCount}<span>좋아요</span>`;
//       showToast('좋아요 취소');
//     } else if (response.status === 401) {
//       alert('로그인이 필요합니다.');
//       window.location.href = '/login';
//     } else {
//       alert('좋아요 요청 실패');
//     }
//   } catch (error) {
//     console.error('좋아요 삭제 실패:', error);
//   }
// }

// backButton.addEventListener('click', () => window.history.back());

// editPostButton.addEventListener('click', () => {
//   const postId = new URLSearchParams(window.location.search).get('id');
//   window.location.href = `/post-edit?id=${postId}`;
// });

// deletePostButton.addEventListener('click', () => {
//   showModal('정말 게시글을 삭제하시겠습니까?', () => {
//     const postId = new URLSearchParams(window.location.search).get('id');
//     deletePost(postId);
//   });
// });

// document.addEventListener('DOMContentLoaded', async () => {
//   const postId = new URLSearchParams(window.location.search).get('id');

//   if (!postId || isNaN(postId)) {
//     alert('Post ID가 없습니다.');
//     window.location.href = '/post-list';
//     return;
//   }

//   try {
//     await viewPost(postId);

//     // 좋아요 상태 초기화
//     const isLiked = await fetchLikeStatus(postId, likeButton);
//     console.log(`좋아요 상태: ${isLiked}`);

//     likeButton.addEventListener('click', async () => {
//       // 현재 상태 확인
//       const isLiked = likeButton.classList.contains('liked');

//       if (isLiked) {
//         await removeLikes(postId);
//       } else {
//         await addLikes(postId);
//       }
//     });
//   } catch (error) {
//     console.error('초기화 중 오류:', error);
//   }
// });
