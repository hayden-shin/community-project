const SERVER_URL = '3.38.209.206';

export async function fetchUserProfile() {
  try {
    const response = await fetch(`http://${SERVER_URL}:3000/users/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      return result.data;
    } else {
      alert('오류 발생');
    }
  } catch (error) {
    console.log(error);
  }
}
