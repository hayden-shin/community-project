// 날짜 및 시간 포맷 함수
export const formatDateTime = (date) => {
  const dateObj = new Date(date); // 날짜 문자열을 Date 객체로 변환
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

// 숫자 축약 함수 (1k, 10k, 100k)
export const formatNumber = (number) => {
  if (number >= 100000) return `${Math.floor(number / 1000)}k`;
  if (number >= 10000) return `${Math.floor(number / 1000)}k`;
  if (number >= 1000) return `${Math.floor(number / 1000)}k`;
  return number;
};
