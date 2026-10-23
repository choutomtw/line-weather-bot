const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sample_data.json', 'utf-8'));

// 直接抓取第一個鄉鎮的氣象元素陣列
const we = data.records.Locations[0].Location[0].WeatherElement;

const tElement = we.find(e => e.ElementName === '溫度');
console.log("1. 溫度 的第一筆時間結構：\n", JSON.stringify(tElement.Time[0], null, 2));

const popElement = we.find(e => e.ElementName.includes('降雨機率'));
console.log("\n2. 降雨機率 的第一筆時間結構：\n", JSON.stringify(popElement.Time[0], null, 2));