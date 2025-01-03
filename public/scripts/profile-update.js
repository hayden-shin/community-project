import BASE_URL from '../config.js';
import { showModal, closeModal } from './common.js';
import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await fetchUserProfile();

    if (userProfile) {
      document.getElementById('email').value = user.email;
      document.getElementById('nickname').value = user.nickname;
      document.getElementById('profile-image-preview').src = user.profileImage;
    } else {
      console.log('userProfile이 없습니다.');
    }
  } catch (error) {
    console.log(`프로필 초기화 중 오류: ${error.message}`);
  }

  const nickname = document.getElementById('nickname');
  const nicknameHelper = document.getElementById('nickname-helper');

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = `toast-message`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  };

  // 닉네임 유효성 검사
  const validateNickname = () => {
    const nicknameValue = nickname.value.trim();

    if (!nicknameValue) {
      nicknameHelper.textContent = '*닉네임을 입력해주세요.';
    } else if (nickname.length > 10) {
      nicknameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
    }
  };

  // 로그아웃 요청
  async function logout() {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('로그아웃 성공!');
        window.location.href = '/login';
      } else if (response.status === 400) {
        const result = await response.json();
        alert('로그아웃 실패: ' + result.message);
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const logoutButton = document.getElementById('logout');
  logoutButton.addEventListener('click', logout);

  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');
  modalConfirmButton.addEventListener('click', () => {
    deleteAccount();
  });

  // 프로필 업데이트
  async function updateProfile(email, nickname, profileImage) {
    try {
      const formData = new FormData();
      if (email) formData.append('newEmail', email);
      if (nickname) formData.append('newNickname', nickname);
      if (profileImage) formData.append('image', profileImage);

      const response = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        showToast('프로필 업데이트 성공!');
        const updatedProfile = await fetchUserProfile();
        document.getElementById('profile-image-preview').src =
          updatedProfile.profileImage + `?t=${Date.now()}`; // 캐시 방지
        window.location.reload();
      } else if (response.status === 400) {
        alert('잘못된 요청입니다.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자입니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 회원 탈퇴
  async function deleteAccount() {
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
      } else if (response.status === 400) {
        alert('잘못된 요청입니다.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자이거나 비밀번호가 틀렸습니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('계정 삭제 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
});

// 사용자 프로필 불러오기
const profile = () => {
  const userProfile = document.createElement('div');
  const userProfileContents = `
  <div class="form-group">
      <label for="profile-image" class="profile-label">프로필 사진*</label>
      <div class="profile-image-wrapper">
          <div class="profile-image-container">
              <img src="../assets/headerpic.png" alt="프로필 사진" class="profile-image" id="profile-image-preview" />
              <label for="profile-image-upload" class="change-photo-label">변경</label>
              <input type="file" id="profile-image-upload" accept="image/*" style="display: none;" />
          </div>
      </div>
  </div>

  <div class="form-group">
      <label for="email">이메일</label>
      <input type="email" id="email" value="hayden@gmail.com">
      <!-- <input type="email" id="email" value="hayden@gmail.com" readonly> -->
  </div>

  <div class="form-group">
      <label for="nickname">닉네임</label>
      <input type="text" id="nickname" value="헤이든">
      <span class="helper-text" id="nickname-helper"></span>
  </div>`;

  userProfile.innerHTML = userProfileContents;
};

// 프로필 수정 버튼과 이벤트 연결
const updateProfileButton = document.getElementById('update-profile-button');
updateProfileButton.addEventListener('click', (e) => {
  e.preventDefault();

  const nickname = document.getElementById('nickname').value.trim();
  const email = document.getElementById('email').value.trim();
  const profileImage = document.getElementById('profile-image-upload').files[0];
  updateProfile(email, nickname, profileImage);
});

// 프로필 이미지 미리보기
const profileImageUpload = document.getElementById('profile-image-upload');
const profileImagePreview = document.getElementById('profile-image-preview');

profileImageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImagePreview.src = e.target.result; // 미리보기 이미지 업데이트
    };
    reader.readAsDataURL(file);
  }
});

// 수정 완료 버튼 클릭시 post-list로 이동
const editConfirmButton = document.getElementById('edit-confirm-button');
editConfirmButton.addEventListener('click', () => {
  window.location.href = '/post-list';
});

const deleteAccountButton = document.getElementById('delete-account-button');
deleteAccountButton.addEventListener('click', () => {
  showModal('정말 계정을 삭제하시겠습니까?', () => {
    deleteAccount();
  });
});

modalCancelButton.addEventListener('click', closeModal);
// modalConfirmButton.addEventListener('click', confirmDeleteAccount);
modalConfirmButton.addEventListener('click', () => {
  confirmDeleteAccount();
  closeModal();
});

const confirmDeleteAccount = () => {
  deleteAccount();
};
