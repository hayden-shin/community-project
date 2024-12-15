const fs = require('fs');
const path = require('path');

// 데이터 읽기 함수
exports.readJSONFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to read file: ${filePath}. Returning empty array.`);
    return []; // 기본값 반환
  }
};

// 데이터 쓰기 함수
exports.writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote data to: ${filePath}`);
  } catch (error) {
    console.error(`Failed to write file: ${filePath}`);
    throw new Error('파일 저장 중 오류가 발생했습니다.');
  }
};
