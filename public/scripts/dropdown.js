document.addEventListener('DOMContentLoaded', () => {
  const profileIcon = document.querySelector('.header-profile-img');
  const dropdownMenu = document.getElementById('dropdown-menu');

  // 드롭다운 메뉴 토글 함수
  const toggleDropdownMenu = (event) => {
    event.stopPropagation();
    const isVisible = window.getComputedStyle(dropdownMenu).display === 'block';
    dropdownMenu.style.display = isVisible ? 'none' : 'block';
  };

  // 드롭다운 메뉴 닫기 함수
  const closeDropdownMenu = () => {
    dropdownMenu.style.display = 'none';
  };

  // 드롭다운 항목 클릭 처리 함수
  const handleDropdownClick = (event) => {
    const { id } = event.target;
    const navigationMap = {
      'profile-update': '/profile-update',
      'password-update': '/password-update',
      logout: '/login',
    };

    if (navigationMap[id]) {
      window.location.href = navigationMap[id];
    }
  };

  // 드롭다운 메뉴 토글
  profileIcon.addEventListener('click', (event) => {
    toggleDropdownMenu(event);
  });

  // 드롭다운 메뉴 닫기 이벤트 등록
  window.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && event.target !== profileIcon) {
      closeDropdownMenu();
    }
  });

  // 드롭다운 항목 클릭 처리
  dropdownMenu.addEventListener('click', (event) => {
    handleDropdownClick(event);
  });
});
