import { isValidEmail, isValidPassword } from './common.js';
import BASE_URL from '../config.js';

const checkAllValid = () => {
  return (
    isValidEmail(email.value.trim()) &&
    isValidPassword(password.value.trim()) &&
    password.value === confirmPassword.value &&
    nickname.value.trim().length > 0 &&
    nickname.value.trim().length <= 10
  );
};

const email = document.getElementById('email');
const emailHelper = document.getElementById('email-helper');
email.addEventListener('input', async () => {
  const emailValue = email.value.trim();

  if (!emailValue) {
    emailHelper.textContent = '*이메일을 입력해주세요.';
  } else if (!isValidEmail(emailValue)) {
    emailHelper.textContent = '*올바른 이메일 주소 형식을 입력해주세요.';
  } else {
    emailHelper.textContent = '';
  }
});

const password = document.getElementById('password');
const passwordHelper = document.getElementById('password-helper');
password.addEventListener('input', () => {
  const passwordValue = password.value.trim();

  if (!passwordValue) {
    passwordHelper.textContent = '*비밀번호를 입력해주세요.';
  } else if (!isValidPassword(passwordValue)) {
    passwordHelper.textContent =
      '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
  } else {
    passwordHelper.textContent = '';
  }
});

const confirmPassword = document.getElementById('confirm-password');
const confirmPasswordHelper = document.getElementById(
  'confirm-password-helper'
);
confirmPassword.addEventListener('input', () => {
  const confirmPasswordValue = confirmPassword.value.trim();

  if (!confirmPasswordValue) {
    confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordHelper.textContent = '*비밀번호가 일치하지 않습니다.';
  } else {
    confirmPasswordHelper.textContent = '';
  }
});

const nickname = document.getElementById('nickname');
const nicknameHelper = document.getElementById('nickname-helper');
nickname.addEventListener('input', () => {
  const nicknameValue = nickname.value.trim();

  if (!nicknameValue) {
    nicknameHelper.textContent = '*닉네임을 입력해주세요.';
  } else if (nicknameValue.length > 10) {
    nicknameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
  } else {
    nicknameHelper.textContent = '';
  }
});

const profileImage = document.getElementById('profile-image');
const profileImageHelper = document.getElementById('profile-image-helper');
profileImage.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    profileImageHelper.textContent = '*프로필 사진을 추가해주세요.';
    return;
  }

  // image 미리보기
  profileImageHelper.textContent = '';
  const reader = new FileReader();
  reader.onload = () => {
    const img =
      document.querySelector('.profile-img-placeholder img') ||
      document.createElement('img');
    img.src = reader.result;
    img.alt = 'Uploaded Profile Image';
    img.style.cssText = 'border-radius: 50%; width: 100px; height: 100px;';
    if (!img.parentNode)
      document.querySelector('.profile-img-placeholder').appendChild(img);
  };
  reader.readAsDataURL(file);
});

// 회원가입 요청
async function signup(profileImage, email, password, nickname) {
  if (!email || !password || !nickname) {
    alert('이메일, 비밀번호, 닉네임은 필수 입력값입니다.');
    return;
  }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('nickname', nickname);

  if (profileImage) {
    formData.append('image', profileImage);
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (response.status === 201) {
      const result = await response.json();
      alert(`회원가입 성공! 사용자 ID: ${result.data.id}`);
      console.log(`회원가입 데이터: ${result.data}`);
      window.location.href = '/login';
    } else if (response.status === 400) {
      const result = await response.json();
      alert('회원가입 실패: ' + result.message);
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('회원가입 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

const signupButton = document.getElementById('signup-button');
const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const emailValue = email.value;
  const passwordValue = password.value;
  const nicknameValue = nickname.value;
  const profileImageValue = profileImage.files[0] || null;

  await signup(profileImageValue, emailValue, passwordValue, nicknameValue);
});

signupForm.addEventListener('input', () => {
  signupButton.disabled = !checkAllValid();
  signupButton.style.backgroundColor = checkAllValid() ? '#7F6AEE' : '#ACA0EB';
});
