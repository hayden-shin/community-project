document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소들
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  const passwordUpdateButton = document.getElementById(
    'password-update-button'
  );
  const newPasswordHelper = document.getElementById('new-password-helper');
  const confirmPasswordHelper = document.getElementById(
    'confirm-password-helper'
  );

  // 비밀번호 유효성 검사 함수
  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(password);
  };

  // 모든 필드가 유효한지 확인
  const allFieldsValid = () =>
    isValidPassword(newPassword.value) &&
    newPassword.value === confirmPassword.value;

  // 버튼 상태 토글
  const toggleButtonState = () => {
    if (allFieldsValid()) {
      passwordUpdateButton.disabled = false;
      passwordUpdateButton.style.backgroundColor = '#7F6AEE'; // 활성 상태 색상
    } else {
      passwordUpdateButton.disabled = true;
      passwordUpdateButton.style.backgroundColor = '#ACA0EB'; // 비활성 상태 색상
    }
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

  // 초기 버튼 상태 설정
  passwordUpdateButton.disabled = true;
  passwordUpdateButton.style.backgroundColor = '#ACA0EB'; // 초기 비활성 상태

  // 새 비밀번호 입력 유효성 검사
  newPassword.addEventListener('input', () => {
    const newPasswordValue = newPassword.value;

    if (!newPasswordValue.trim()) {
      newPasswordHelper.textContent = '*비밀번호를 입력해주세요.';
      newPasswordHelper.style.color = 'black';
    } else if (!isValidPassword(newPasswordValue)) {
      newPasswordHelper.textContent =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      newPasswordHelper.style.color = 'red';
    } else {
      newPasswordHelper.textContent = '유효한 비밀번호입니다.';
      newPasswordHelper.style.color = 'green';
    }

    toggleButtonState();
  });

  // 비밀번호 확인 입력 유효성 검사
  confirmPassword.addEventListener('input', () => {
    const confirmPasswordValue = confirmPassword.value;

    if (!confirmPasswordValue.trim()) {
      confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
      confirmPasswordHelper.style.color = 'red';
    } else if (newPassword.value !== confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호와 다릅니다.';
      confirmPasswordHelper.style.color = 'red';
    } else {
      confirmPasswordHelper.textContent = '비밀번호가 일치합니다.';
      confirmPasswordHelper.style.color = 'green';
    }

    toggleButtonState();
  });

  // 비밀번호 변경 버튼 클릭 핸들러
  passwordUpdateButton.addEventListener('click', (event) => {
    event.preventDefault();

    if (allFieldsValid()) {
      showToastAndRedirect('비밀번호가 성공적으로 변경되었습니다!', './login');
    }
  });
});
