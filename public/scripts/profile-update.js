import BASE_URL from '../config.js';
import {
  showModal,
  closeModal,
  showToast,
  toggleButtonState,
} from './common.js';
import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await fetchUserProfile();

    if (user) {
      const emailInput = document.getElementById('email');
      const usernameInput = document.getElementById('username');
      const profileImagePreview = document.getElementById(
        'profile-image-preview'
      );

      if (emailInput) emailInput.value = user.email;
      if (usernameInput) usernameInput.value = user.username;
      if (profileImagePreview) profileImagePreview.src = user.profileImage;
    } else {
      console.warn('유저 프로필 정보를 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error(`프로필 초기화 중 오류 발생: ${error.message}`);
  }

  const usernameInput = document.getElementById('username');
  const usernameHelper = document.getElementById('username-helper');

  if (!usernameInput || !usernameHelper) {
    console.error('닉네임 입력 또는 도움말 요소를 찾을 수 없습니다.');
    return;
  }

  usernameInput.addEventListener('input', () => {
    const usernameValue = usernameInput.value.trim();

    if (!usernameValue) {
      usernameHelper.textContent = '*닉네임을 입력해주세요.';
      toggleButtonState(updateProfileButton, false);
    } else if (usernameValue.length > 10) {
      usernameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
      toggleButtonState(updateProfileButton, false);
    } else {
      usernameHelper.textContent = '';
      toggleButtonState(updateProfileButton, true);
    }
  });

  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          showToast('로그아웃 성공!');
          window.location.href = '/login';
        } else {
          alert('로그아웃 실패. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('로그아웃 요청 실패:', error);
        alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  } else {
    console.warn('로그아웃 버튼을 찾을 수 없습니다.');
  }

  const updateProfileButton = document.getElementById('update-profile-button');
  if (updateProfileButton) {
    updateProfileButton.addEventListener('click', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username')?.value.trim();
      const profileImage = document.getElementById('profile-image-upload')
        ?.files[0];

      if (!username) {
        alert('닉네임을 입력해주세요.');
        return;
      }

      await updateProfile(username, profileImage);
    });
  }

  const updateProfile = async (username, profileImage) => {
    try {
      const formData = new FormData();
      if (username) formData.append('username', username);
      if (profileImage) formData.append('image', profileImage);

      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        showToast('프로필 업데이트 성공!');
        document.getElementById('username').value =
          updatedProfile.data.username || username;
        document.getElementById('profile-image-preview').src =
          `${BASE_URL}${updatedProfile.data.profileImage || profileImage}`;
        document.getElementById('header-profile-image').src =
          `${BASE_URL}${updatedProfile.data.profileImage || profileImage}`;
      } else {
        const result = await response.json();
        alert(`프로필 업데이트 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('프로필 업데이트 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const profileImageUpload = document.getElementById('profile-image-upload');
  const profileImagePreview = document.getElementById('profile-image-preview');

  if (profileImageUpload && profileImagePreview) {
    profileImageUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          profileImagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    console.warn('프로필 이미지 업로드 요소를 찾을 수 없습니다.');
  }

  const deleteAccountButton = document.getElementById('delete-account-button');
  if (deleteAccountButton) {
    deleteAccountButton.addEventListener('click', () => {
      showModal('정말 계정을 삭제하시겠습니까?', async () => {
        try {
          const response = await fetch(`${BASE_URL}/auth/account`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            showToast('회원 탈퇴 성공!');
            window.location.href = '/signup';
          } else {
            const result = await response.json();
            alert(`회원 탈퇴 실패: ${result.message}`);
          }
        } catch (error) {
          console.error('회원 탈퇴 요청 실패:', error);
          alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      });
    });
  } else {
    console.warn('회원 탈퇴 버튼을 찾을 수 없습니다.');
  }

  const editConfirmButton = document.getElementById('edit-confirm-button');
  if (editConfirmButton) {
    editConfirmButton.addEventListener('click', () => {
      window.location.href = '/post-list';
    });
  } else {
    console.warn('수정 완료 버튼을 찾을 수 없습니다.');
  }
});
