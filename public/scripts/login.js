document.addEventListener('DOMContentLoaded', () => {
  // 사용자 데이터
  const usersData = [
    { email: 'hayden@gmail.com', password: '!Hayden2024' },
    { email: 'user@gmail.com', password: '!User2024' },
  ];

  // DOM 요소 선택
  const loginForm = document.querySelector('.login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login-button');
  const emailHelper = document.getElementById('email-helper');
  const passwordHelper = document.getElementById('password-helper');

  // 유효한 이메일 형식 확인
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 유효한 비밀번호 형식 확인
  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      password
    );

  // 헬퍼 텍스트 업데이트
  const updateHelperText = (helperElement, message, color) => {
    helperElement.textContent = message;
    helperElement.style.color = color;
  };

  // 로그인 버튼 활성화 상태 확인
  const checkLoginButtonState = () => {
    const emailValid = isValidEmail(emailInput.value);
    const passwordValid = isValidPassword(passwordInput.value);
    const buttonActive = emailValid && passwordValid;

    loginButton.disabled = !buttonActive;
    loginButton.style.backgroundColor = buttonActive ? '#7F6AEE' : '#ACA0EB';
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

  // 이메일 유효성 검사
  const validateEmail = () => {
    const email = emailInput.value.trim();

    if (!email) {
      updateHelperText(emailHelper, '*이메일을 입력해주세요.', 'red');
    } else if (!isValidEmail(email)) {
      updateHelperText(
        emailHelper,
        '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
        'red'
      );
    } else if (!usersData.some((user) => user.email === email)) {
      updateHelperText(emailHelper, '*등록되지 않은 이메일입니다.', 'red');
    } else {
      updateHelperText(emailHelper, '올바른 이메일 형식입니다.', 'green');
    }
    checkLoginButtonState();
  };

  // 비밀번호 유효성 검사
  const validatePassword = () => {
    const password = passwordInput.value.trim();

    if (!password) {
      updateHelperText(passwordHelper, '*비밀번호를 입력해주세요.', 'red');
    } else if (!isValidPassword(password)) {
      updateHelperText(
        passwordHelper,
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
        'red'
      );
    } else {
      updateHelperText(passwordHelper, '안전한 비밀번호입니다.', 'green');
    }
    checkLoginButtonState();
  };

  // 로그인 처리
  const handleLogin = (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const user = usersData.find((user) => user.email === email);

    if (!user) {
      updateHelperText(emailHelper, '*등록되지 않은 이메일입니다.', 'red');
      return;
    }

    if (user.password !== password) {
      updateHelperText(passwordHelper, '*비밀번호가 다릅니다.', 'red');
      return;
    }

    showToastAndRedirect('로그인 성공', './post-list'); // 로그인 성공 토스트 메세지 + 리다이렉트
  };

  // 이벤트 리스너 등록
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  loginForm.addEventListener('submit', handleLogin);

  // 초기 로그인 버튼 상태 확인
  checkLoginButtonState();
});
