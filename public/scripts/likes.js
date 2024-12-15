// import { showToast } from './common.js';

// const likeButton = document.getElementById('like-button');

// export async function fetchLikeStatus(postId) {
//   try {
//     const response = await fetch(
//       `http://localhost:3000/posts/${postId}/likes`,
//       {
//         method: 'GET',
//         credentials: 'include',
//       }
//     );

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
//     const response = await fetch(
//       `http://localhost:3000/posts/${postId}/likes`,
//       {
//         method: 'POST',
//         credentials: 'include',
//       }
//     );

//     if (response.ok) {
//       const result = await response.json();
//       const { likes } = result.data;

//       likeButton.classList.add('liked');
//       likeButton.innerHTML = `${likes}<span>좋아요</span>`;
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
//   const response = await fetch(`http://localhost:3000/posts/${postId}/likes`, {
//     method: 'DELETE',
//     credentials: 'include',
//   });

//   if (response.ok) {
//     const result = await response.json();
//     const { likes } = result.data;

//     likeButton.classList.remove('liked');
//     likeButton.innerHTML = `${likes}<span>좋아요</span>`;
//     showToast('좋아요 취소');
//   } else if (response.status == 401) {
//     alert('로그인이 필요합니다.');
//     window.location.href = '/login';
//   } else {
//     alert('좋아요 요청 실패');
//   }

//   try {
//   } catch (error) {
//     console.log(error);
//   }
// }

// likeButton.addEventListener('click', async () => {
//   const postId = new URLSearchParams(window.location.search).get('id');
//   console.log(`post ID: ${postId}`);

//   // 현재 상태 확인
//   const isLiked = likeButton.classList.contains('liked');

//   if (isLiked) {
//     await removeLikes(postId);
//   } else {
//     await addLikes(postId);
//   }
// });
