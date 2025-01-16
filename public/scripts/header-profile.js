import { BASE_URL } from '../config.js';

async function fetchUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.log('something went wrong!');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('프로필 데이터를 가져오는 중 오류 발생:', error);
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('header').textContent = '모두의 이야기';

  try {
    const user = await fetchUserProfile();
    if (user) {
      const headerImage = document.getElementById('header-profile-image');
      if (user.url) {
        headerImage.src = user.url;
      } else {
        headerImage.src = `${BASE_URL}/assets/default-profile-image.jpg`;
      }
    }
  } catch (error) {
    console.error('헤더 프로필 이미지 업데이트 실패:', error);
  }
});
