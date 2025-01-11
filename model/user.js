import { db } from '../db/database.js';

// JSON 파일에서 사용자 데이터를 읽어오는 함수
export function readUsersFromFile() {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일에 사용자 데이터를 저장하는 함수
export function writeUsersToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}
