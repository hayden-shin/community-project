const SERVER_URL = 'http://localhost:3000';

async function fetchUserProfile() {
  try {
    const response = await fetch(`http://localhost:3000/users/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.error('프로필 데이터를 가져오는 중 오류 발생:', error);
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await fetchUserProfile();
    console.log('user.profileImage:', user.profileImage);

    if (user) {
      const headerProfileImage = document.getElementById(
        'header-profile-image'
      );
      if (headerProfileImage) {
        if (user.profileImage) {
          headerProfileImage.src = user.profileImage;
        } else {
          // 기본 프로필 이미지 경로 사용
          headerProfileImage.src = `${SERVER_URL}/assets/default-profile.jpg`;
        }
      }
    }
  } catch (error) {
    console.error('헤더 프로필 이미지 업데이트 실패:', error);
  }
});
