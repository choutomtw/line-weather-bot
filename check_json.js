const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sample_data.json', 'utf-8'));

// 已知第一層是大寫 Locations
const locs = data.records.Locations;

console.log("1. 第一層縣市陣列長度：", locs.length);
console.log("2. 縣市資料的欄位：", Object.keys(locs[0]));

// 往下探測鄉鎮結構
const towns = locs[0].Location || locs[0].location;
console.log("3. 鄉鎮資料的欄位：", Object.keys(towns[0]));

// 往下探測氣象元素結構
const elements = towns[0].WeatherElement || towns[0].weatherElement;
console.log("4. 氣象元素欄位：", Object.keys(elements[0]));

// 往下探測時間結構
const times = elements[0].Time || elements[0].time;
if (times && times.length > 0) {
  console.log("5. 時間陣列欄位：", Object.keys(times[0]));
} else {
  console.log("5. 時間陣列：找不到或為空");
}