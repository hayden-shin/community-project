document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 선택
  const dropdownMenu = document.getElementById('dropdown-menu');
  const profileIcon = document.querySelector('.header-profile-img');
  const logout = document.getElementById('logout');
  const editNicknameButton = document.getElementById('edit-nickname-button');
  const nicknameInput = document.getElementById('nickname');
  const nicknameHelper = document.getElementById('nickname-helper');
  const deleteAccountButton = document.getElementById('delete-account-button');
  const modal = document.getElementById('confirmation-modal');
  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');

  // 닉네임 중복 확인을 위한 모의 사용자 데이터
  const users = [{ nickname: 'hayden' }, { nickname: 'user' }];

  // 토스트 메시지 표시
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = `toast-message`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  };

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 지정된 시간 후 토스트 메시지 제거 및 페이지 이동
    setTimeout(() => {
      toast.remove(); // 토스트 메시지 제거
      window.location.href = url; // 페이지 이동
    }, duration);
  };

  // 프로필 아이콘 드롭다운
  const toggleDropdownMenu = (event) => {
    event.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === 'block' ? 'none' : 'block';
  };

  const closeDropdownMenu = () => {
    dropdownMenu.style.display = 'none';
  };

  const handleDropdownHover = (event) => {
    if (event.target.tagName === 'LI') {
      event.target.style.backgroundColor =
        event.type === 'mouseover' ? '#E9E9E9' : 'transparent';
    }
  };

  profileIcon.addEventListener('click', toggleDropdownMenu);
  window.addEventListener('click', closeDropdownMenu);
  dropdownMenu.addEventListener('mouseover', handleDropdownHover);
  dropdownMenu.addEventListener('mouseout', handleDropdownHover);

  // 드롭다운 메뉴 클릭 시 페이지 이동
  const handleDropdownClick = (event) => {
    const { id } = event.target;
    const navigationMap = {
      'edit-profile': './profile-update',
      'change-password': './password-update',
      logout: './login',
    };

    if (navigationMap[id]) {
      window.location.href = navigationMap[id];
    }
  };

  dropdownMenu.addEventListener('click', handleDropdownClick);

  // 닉네임 수정 시 유효성 검사
  const validateNickname = () => {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
      nicknameHelper.textContent = '*닉네임을 입력해주세요.';
      nicknameHelper.style.color = 'red';
    } else if (nickname.length > 10) {
      nicknameHelper.textContent = '*닉네임은 최대 10자 까지 작성 가능합니다.';
      nicknameHelper.style.color = 'red';
    } else if (users.some((user) => user.nickname === nickname)) {
      nicknameHelper.textContent = '*중복된 닉네임 입니다.';
      nicknameHelper.style.color = 'red';
    } else {
      nicknameHelper.textContent = '';
      showToast('수정 완료');
    }
  };

  editNicknameButton.addEventListener('click', validateNickname);

  // 회원 탈퇴 모달
  const openModal = () => {
    modal.style.display = 'block';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  const confirmDeleteAccount = () => {
    showToastAndRedirect('회원 탈퇴가 완료되었습니다.', './login');
  };

  deleteAccountButton.addEventListener('click', openModal);
  modalCancelButton.addEventListener('click', closeModal);
  modalConfirmButton.addEventListener('click', confirmDeleteAccount);
});
