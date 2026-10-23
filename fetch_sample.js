const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.CWA_API_KEY;
const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-065?Authorization=${API_KEY}&format=JSON`;

async function fetchAndSave() {
  try {
    console.log('正在抓取氣象資料...');
    const response = await axios.get(URL);
    fs.writeFileSync('sample_data.json', JSON.stringify(response.data, null, 2));
    console.log('成功！資料已儲存至 sample_data.json');
  } catch (error) {
    console.error('抓取資料失敗：', error);
  }
}

fetchAndSave();