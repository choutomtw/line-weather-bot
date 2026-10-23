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

// 建立地區與對應 API ID 的字典結構
const locationApiMap = {
  '旗津區': 'F-D0047-065',
  '左營區': 'F-D0047-065',
  '蘇澳鎮': 'F-D0047-001'
};

async function getLiveWeatherData(locationName) {
  const datasetId = locationApiMap[locationName];
  
  if (!datasetId) {
    throw new Error('目前未支援此地區。請輸入：旗津區、左營區 或 蘇澳鎮');
  }

  const API_KEY = process.env.CWA_API_KEY;
  const URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${datasetId}?Authorization=${API_KEY}&format=JSON`;
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
    const locationName = userMessage.substring(4).trim();
    console.log(`[指令觸發] 目標地區：${locationName}`);

    try {
      const jsonData = await getLiveWeatherData();
      const weatherData = parseWeatherData(jsonData, locationName);
      const replyText = formatWeatherMessage(locationName, weatherData);
      
      // 替換為新版 SDK 的回覆格式
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: replyText }]
      });
    } catch (error) {
      console.error(`[錯誤] 處理 ${locationName} 時發生錯誤：`, error.message);
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