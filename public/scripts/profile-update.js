import { BASE_URL, CDN_URL } from '../config.js';
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
      const urlPreview = document.getElementById('profile-image-preview');

      if (emailInput) emailInput.value = user.email;
      if (usernameInput) usernameInput.value = user.username;
      if (urlPreview) urlPreview.src = user.url;
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
      const url = document.getElementById('profile-image-upload')?.files[0];

      if (!username) {
        alert('닉네임을 입력해주세요.');
        return;
      }

      await updateProfile(username, url);
    });
  }

  const updateProfile = async (username, url) => {
    try {
      const formData = new FormData();
      if (username) formData.append('username', username);
      if (url) formData.append('image', url);

      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        showToast('프로필 업데이트 성공!');
        document.getElementById('username').value = result.username || username;
        document.getElementById('profile-image-preview').src =
          `${CDN_URL}${result.url || url}`;
        document.getElementById('header-profile-image').src =
          `${CDN_URL}${result.url || url}`;
      } else {
        const result = await response.json();
        alert(`프로필 업데이트 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('프로필 업데이트 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const urlUpload = document.getElementById('profile-image-upload');
  const urlPreview = document.getElementById('profile-image-preview');

  if (urlUpload && urlPreview) {
    urlUpload.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          urlPreview.src = e.target.result;
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
