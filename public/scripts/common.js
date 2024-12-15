const headerText = document.getElementById('header');
headerText.addEventListener('click', () => {
  window.location.href = '/post-list';
});

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
    password
  );

export const toggleButtonState = (
  button,
  isValid,
  activeColor = '#7F6AEE',
  inactiveColor = '#ACA0EB'
) => {
  if (isValid) {
    button.disabled = false;
    button.style.backgroundColor = activeColor;
  } else {
    button.disabled = true;
    button.style.backgroundColor = inactiveColor;
  }
};

// 토스트 메세지
export const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000); // 2초 후 제거
};

export const showToastAndRedirect = (message, url, duration = 2000) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    window.location.href = url;
  }, duration);
};

const createToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
};

export const displayStoredToast = () => {
  const message = sessionStorage.getItem('toastMessage');
  if (message) {
    createToast(message);
    sessionStorage.removeItem('toastMessage');
  }
};

// 모달

const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCancelButton = document.getElementById('modal-cancel-button');
const modalConfirmButton = document.getElementById('modal-confirm-button');

export const showModal = (message, onConfirm) => {
  modalMessage.textContent = message;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  modalConfirmButton.onclick = () => {
    onConfirm();
    closeModal();
  };

  modalCancelButton.onclick = closeModal;
};

export const closeModal = () => {
  modal.style.display = 'none';
  document.body.style.overflow = '';
};
