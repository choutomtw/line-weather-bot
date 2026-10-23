// test_parser.js
const fs = require('fs');
const { parseWeatherData, formatWeatherMessage } = require('./weather_parser');

const rawData = fs.readFileSync('sample_data.json', 'utf-8');
const jsonData = JSON.parse(rawData);

try {
  console.log('--- 測試：/氣象-高雄 ---');
  const kaohsiungData = parseWeatherData(jsonData, '高雄');
  const message = formatWeatherMessage('高雄', kaohsiungData);
  console.log(message);
} catch (error) {
  console.error('錯誤：', error.message);
}

console.log('\n========================\n');

try {
  console.log('--- 測試：/氣象-未知地區 ---');
  const unknownData = parseWeatherData(jsonData, '屏東');
  console.log(unknownData);
} catch (error) {
  console.error('預期內的錯誤：', error.message);
}