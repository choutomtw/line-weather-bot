// index.js
const express = require('express');
const { middleware, messagingApi } = require('@line/bot-sdk');
const axios = require('axios');
const { parseWeatherData, formatWeatherMessage } = require('./weather_parser');
require('dotenv').config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// 替換為新版 SDK 的宣告方式
const client = new messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

const app = express();
const processedEvents = new Set();

// 增強版地區映射表（自動轉換簡稱與預設值）
const locationMapping = {
  '高雄': { apiId: 'F-D0047-065', realName: '左營區' },   // 預設高雄抓左營
  '高雄市': { apiId: 'F-D0047-065', realName: '左營區' },
  '左營': { apiId: 'F-D0047-065', realName: '左營區' },
  '左營區': { apiId: 'F-D0047-065', realName: '左營區' },
  '旗津': { apiId: 'F-D0047-065', realName: '旗津區' },
  '旗津區': { apiId: 'F-D0047-065', realName: '旗津區' },
  '蘇澳': { apiId: 'F-D0047-001', realName: '蘇澳鎮' },
  '蘇澳鎮': { apiId: 'F-D0047-001', realName: '蘇澳鎮' }
};

// 抓取即時氣象資料
async function getLiveWeatherData(apiId) {
  const API_KEY = process.env.CWA_API_KEY;
  const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${apiId}?Authorization=${API_KEY}&format=JSON`;
  const response = await axios.get(URL);
  return response.data;
}

app.post('/webhook', middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).send('OK'))
    .catch((err) => {
      console.error('Webhook 處理發生錯誤：', err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  const eventId = event.webhookEventId;
  if (processedEvents.has(eventId)) {
    console.log(`[去重] 忽略已處理過的事件：${eventId}`);
    return Promise.resolve(null);
  }
  processedEvents.add(eventId);
  setTimeout(() => processedEvents.delete(eventId), 5 * 60 * 1000);

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text.trim();

  if (userMessage.startsWith('/氣象-')) {
    const userInput = userMessage.substring(4).trim(); // 取得使用者輸入的字眼
    console.log(`[指令觸發] 使用者輸入：${userInput}`);

    try {
      // 1. 從字典尋找對應的設定
      const mappedData = locationMapping[userInput];
      
      if (!mappedData) {
        throw new Error('目前未支援此地區。請輸入：/氣象-高雄(左營、旗津或蘇澳)');
      }

      // 2. 使用對應的 apiId 抓取資料
      const jsonData = await getLiveWeatherData(mappedData.apiId);
      
      // 3. 使用真實名稱 (realName) 讓 parser 去解析
      const weatherData = parseWeatherData(jsonData, mappedData.realName);
      
      // 4. 格式化訊息並回覆
      const replyText = formatWeatherMessage(mappedData.realName, weatherData);
      
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: replyText }]
      });
    } catch (error) {
      console.error(`[錯誤] 處理 ${userInput} 時發生錯誤：`, error.message);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: error.message || '發生未知錯誤，請稍後再試。' }]
      });
    }
  }

  return Promise.resolve(null);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器已啟動，正在監聽 Port ${port}`);
});