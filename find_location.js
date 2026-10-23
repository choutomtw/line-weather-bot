// find_location.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sample_data.json', 'utf-8'));

let matchCount = 0;

// 建立一個遞迴函式，深入每個物件與陣列尋找關鍵字
function findPath(obj, keyword, currentPath = 'records') {
  if (matchCount >= 5) return; // 每個關鍵字只印出前 5 個結果，避免洗版
  
  if (typeof obj === 'string' && obj.includes(keyword)) {
    console.log(`${currentPath} = "${obj}"`);
    matchCount++;
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      findPath(obj[i], keyword, `${currentPath}[${i}]`);
      if (matchCount >= 5) return;
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      findPath(obj[key], keyword, `${currentPath}.${key}`);
      if (matchCount >= 5) return;
    }
  }
}

console.log('--- 搜索開始 ---');
console.log('1. 尋找 [高雄] 的確切欄位路徑：');
matchCount = 0;
findPath(data.records, '高雄');

console.log('\n2. 尋找 [旗津] 的確切欄位路徑：');
matchCount = 0;
findPath(data.records, '旗津');
console.log('--- 搜索結束 ---');