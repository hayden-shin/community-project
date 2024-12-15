import { isValidEmail, isValidPassword } from './common.js';

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const emailHelper = document.getElementById('email-helper');
const passwordHelper = document.getElementById('password-helper');

const checkLoginButtonState = () => {
  const emailValid = isValidEmail(emailInput.value.trim());
  const passwordValid = isValidPassword(passwordInput.value.trim());
  const buttonActive = emailValid && passwordValid;

  loginButton.disabled = !buttonActive;
  loginButton.style.backgroundColor = buttonActive ? '#7F6AEE' : '#ACA0EB';
};

// 로그인 요청
async function login(email, password) {
  if (!email || !password) {
    alert('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  if (!isValidPassword) {
    alert(
      '비밀번호는 8자 이상 20자 이하이며, 영문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
    );
    return;
  }

  if (!isValidEmail) {
    alert('올바르지 않은 이메일 입니다.');
  }

  const requestData = {
    email,
    password,
  };

  if (isValidEmail(email) && isValidPassword(password)) {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      if (response.status === 200) {
        const result = await response.json();

        console.log('로그인 응답:', result.data);
        alert(`로그인 성공! 환영합니다, ${result.data.nickname}님.`);
        window.location.href = '/post-list';
      } else if (response.status === 400) {
        const result = await response.json();
        alert('로그인 실패: ' + result.message);
      } else if (response.status === 429) {
        alert('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
}

// 입력값 유효성 검사
emailInput.addEventListener('input', () => {
  const emailValue = emailInput.value.trim();

  if (!emailValue) {
    emailHelper.textContent = '*이메일을 입력해주세요.';
  } else if (!isValidEmail(emailValue)) {
    emailHelper.textContent =
      '*올바른 이메일 형식을 입력해주세요. (예: example@example.com)';
  } else {
    emailHelper.textContent = ''; // 유효성 통과 시 초기화
  }
  checkLoginButtonState();
});

passwordInput.addEventListener('input', () => {
  const passwordValue = passwordInput.value.trim();

  if (!passwordValue) {
    passwordHelper.textContent = '*비밀번호를 입력해주세요.';
  } else if (!isValidPassword(passwordValue)) {
    passwordHelper.textContent =
      '*비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
  } else {
    passwordHelper.textContent = ''; // 유효성 통과 시 초기화
  }
  checkLoginButtonState();
});

loginButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  await login(emailValue, passwordValue);
});

// 초기 버튼 상태 설정
checkLoginButtonState();
