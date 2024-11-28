document.addEventListener('DOMContentLoaded', () => {
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');

  const newPasswordHelper = document.getElementById('new-password-helper');
  const confirmPasswordHelper = document.getElementById(
    'confirm-password-helper'
  );

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

    if (url) {
      // 지정된 시간 후 토스트 메시지 제거 및 페이지 이동
      setTimeout(() => {
        toast.remove(); // 토스트 메시지 제거
        window.location.href = url; // 페이지 이동
      }, duration);
    }
  };

  // 초기화
  passwordUpdateButton.disabled = true;
  passwordUpdateButton.style.backgroundColor = '#ACA0EB'; // 초기 비활성 상태

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

  // 비밀번호 변경 요청
  async function updatePassword(userId, newPassword) {
    // 입력값 유효성 검사
    if (!newPassword) {
      alert('비밀번호를 입력하세요.');
      return;
    }

    // 새 비밀번호 유효성 검사 (8~20자, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        '새 비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      );
      return;
    }

    // 요청 데이터 생성
    const requestData = {
      new_password: newPassword,
    };

    try {
      // API 호출: 비밀번호 수정 요청
      const response = await fetch(
        `http://localhost:3000/users/${userId}/password`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      // 서버 응답 상태 코드 처리
      if (response.status === 201 || response.status === 204) {
        alert('비밀번호가 성공적으로 변경되었습니다!');
        console.log('비밀번호 업데이트 성공');
      } else if (response.status === 400) {
        alert('요청이 잘못되었습니다. 입력값을 확인해주세요.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자이거나 현재 비밀번호가 틀렸습니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      // 네트워크 또는 기타 오류 처리
      console.error('비밀번호 업데이트 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 이벤트 리스너를 통해 비밀번호 업데이트 처리
  const updatePasswordButton = document.getElementById(
    'update-password-button'
  ); // 비밀번호 수정 버튼 선택
  updatePasswordButton.addEventListener('click', () => {
    const userId = localStorage.getItem('user_id'); // 사용자 ID 가져오기
    const newPassword = document.getElementById('new-password').value; // 새 비밀번호 가져오기

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    updatePassword(userId, newPassword); // updatePassword 함수 호출
  });
});
