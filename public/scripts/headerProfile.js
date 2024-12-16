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
  // 현재 페이지의 URL 확인
  // const currentPage = window.location.pathname;

  // // 로그인 및 회원가입 페이지는 제외
  // if (currentPage.includes('login') || currentPage.includes('signup')) {
  //   return; // 아무 작업도 하지 않음
  // }

  try {
    const userProfile = await fetchUserProfile();
    console.log('userProfile.profileImage:', userProfile.profileImage);

    if (userProfile) {
      const headerProfileImage = document.getElementById(
        'header-profile-image'
      );
      if (headerProfileImage) {
        if (userProfile.profileImage) {
          headerProfileImage.src = `${SERVER_URL}${userProfile.profileImage}`;
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
