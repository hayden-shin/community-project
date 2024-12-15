import { isValidPassword } from './common.js';

document.addEventListener('DOMContentLoaded', () => {
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');

  const newPasswordHelper = document.getElementById('new-password-helper');
  const confirmPasswordHelper = document.getElementById(
    'confirm-password-helper'
  );

  const updatePasswordButton = document.getElementById(
    'update-password-button'
  );

  // 버튼 상태 토글 함수
  const toggleButtonState = () => {
    const allValid =
      isValidPassword(newPassword.value.trim()) &&
      newPassword.value === confirmPassword.value;

    updatePasswordButton.disabled = !allValid;
    updatePasswordButton.style.backgroundColor = allValid
      ? '#7F6AEE'
      : '#ACA0EB';
  };

  // 새 비밀번호 입력 유효성 검사
  newPassword.addEventListener('input', () => {
    const newPasswordValue = newPassword.value;

    if (!newPasswordValue.trim()) {
      newPasswordHelper.textContent = '*비밀번호를 입력해주세요.';
      newPasswordHelper.style.color = 'red';
    } else if (!isValidPassword(newPasswordValue)) {
      newPasswordHelper.textContent =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      newPasswordHelper.style.color = 'red';
    }

    toggleButtonState();
  });

  // 비밀번호 확인 입력 유효성 검사
  confirmPassword.addEventListener('input', () => {
    const confirmPasswordValue = confirmPassword.value.trim();

    if (!confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
    } else if (newPassword.value.trim() !== confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호와 다릅니다.';
    } else {
      confirmPasswordHelper.textContent = '';
    }

    toggleButtonState();
  });

  // 비밀번호 변경 요청
  async function updatePassword(newPassword) {
    if (!newPassword) {
      alert('새로운 비밀번호를 입력하세요.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        '새 비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      );
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다!');
        console.log('비밀번호 업데이트 성공!');
      } else if (response.status === 400) {
        alert('잘못된 요청입니다.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자이거나 현재 비밀번호가 틀렸습니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  updatePasswordButton.addEventListener('click', (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value.trim();

    updatePassword(newPassword);
  });
});
