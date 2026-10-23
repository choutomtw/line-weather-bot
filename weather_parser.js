// weather_parser.js

function parseWeatherData(jsonData, locationName) {
  // 1. 檢查 API 是否回傳異常（例如金鑰失效、額度用盡）
  if (!jsonData || !jsonData.records) {
    console.error("[API 回傳異常] 實際收到的資料：", JSON.stringify(jsonData));
    throw new Error('氣象署 API 連線異常，請查看伺服器日誌。');
  }

  // 2. 安全讀取陣列，避免發生 undefined[0] 錯誤
  const countyArray = jsonData.records.Locations;
  if (!countyArray || countyArray.length === 0) {
    console.error("[資料結構錯誤] 實際的 records 內容：", JSON.stringify(jsonData.records).substring(0, 300));
    throw new Error('氣象署回傳的資料結構中找不到 Locations 陣列。');
  }

  // 3. 尋找目標鄉鎮
  const locationsArray = countyArray[0].Location;
  const targetLocationData = locationsArray.find(loc => loc.LocationName === locationName);

  if (!targetLocationData) {
    throw new Error(`氣象資料庫中找不到「${locationName}」的資料。`);
  }

  // 下方繼續保留原本的溫度、濕度、降雨解析邏輯...

  const weatherElements = targetLocationData.WeatherElement;
  
  // 這裡改為比對中文欄位名稱
  const tData = weatherElements.find(e => e.ElementName === '溫度')?.Time || [];
  const rhData = weatherElements.find(e => e.ElementName === '相對濕度')?.Time || [];
  const popData = weatherElements.find(e => e.ElementName.includes('降雨機率'))?.Time || [];

  const daysMap = new Map();

  const getSlot = (hour) => {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'noon';
    if (hour >= 18 && hour < 24) return 'night';
    return null;
  };

  const getOrCreateDay = (dateStr) => {
    if (!daysMap.has(dateStr)) {
      daysMap.set(dateStr, {
        date: dateStr,
        morning: { rhSum: 0, rhCount: 0 },
        noon: { rhSum: 0, rhCount: 0 },
        night: { rhSum: 0, rhCount: 0 },
      });
    }
    return daysMap.get(dateStr);
  };

  const extractValue = (item) => {
    if (!item || !item.ElementValue || !item.ElementValue[0]) return null;
    return Object.values(item.ElementValue[0])[0];
  };

  tData.forEach(item => {
    const timeStr = item.StartTime || item.DataTime;
    if (!timeStr) return;
    const dateObj = new Date(timeStr);
    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const hour = parseInt(dateObj.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Taipei', hour: '2-digit' }), 10);
    
    const slot = getSlot(hour);
    if (slot) {
      const day = getOrCreateDay(dateStr);
      const rawVal = extractValue(item);
      if (rawVal !== null) {
        const temp = parseInt(rawVal, 10);
        if (!isNaN(temp)) {
          if (!day[slot].minT || temp < day[slot].minT) day[slot].minT = temp;
          if (!day[slot].maxT || temp > day[slot].maxT) day[slot].maxT = temp;
        }
      }
    }
  });

  rhData.forEach(item => {
    const timeStr = item.StartTime || item.DataTime;
    if (!timeStr) return;
    const dateObj = new Date(timeStr);
    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const hour = parseInt(dateObj.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Taipei', hour: '2-digit' }), 10);
    
    const slot = getSlot(hour);
    if (slot) {
      const day = getOrCreateDay(dateStr);
      const rawVal = extractValue(item);
      if (rawVal !== null) {
        const rh = parseInt(rawVal, 10);
        if (!isNaN(rh)) {
          day[slot].rhSum += rh;
          day[slot].rhCount += 1;
        }
      }
    }
  });

  popData.forEach(item => {
    const timeStr = item.StartTime || item.DataTime;
    if (!timeStr) return;
    const dateObj = new Date(timeStr);
    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const hour = parseInt(dateObj.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Taipei', hour: '2-digit' }), 10);
    
    const slot = getSlot(hour);
    if (slot) {
      const day = getOrCreateDay(dateStr);
      const rawVal = extractValue(item);
      // 過濾掉空值或氣象署有時用的無效值 '-'
      if (rawVal !== null && rawVal !== ' ' && rawVal !== '-' && rawVal !== '-1') {
        day[slot].pop = rawVal;
      }
    }
  });

  return Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
}

function formatWeatherMessage(locationKey, daysData) {
  if (daysData.length === 0) {
    return `📍 ${locationKey} 目前無法解析出有效的預報區間。`;
  }

  let message = `📍 ${locationKey} 未來三日天氣預報\n`;
  message += `(資料更新時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })})\n\n`;

  daysData.forEach(day => {
    message += `📅 ${day.date}\n`;
    const slots = [
      { name: '早上', data: day.morning },
      { name: '中午', data: day.noon },
      { name: '晚上', data: day.night }
    ];

    slots.forEach(slot => {
      const d = slot.data;
      const t = (d.minT && d.maxT) ? `${d.minT}~${d.maxT}°C` : '無資料';
      const rh = d.rhCount > 0 ? `${Math.round(d.rhSum / d.rhCount)}%` : '無資料';
      const pop = d.pop || '無資料';
      
      message += `[${slot.name}] 氣溫:${t} | 濕度:${rh} | 降雨:${pop}%\n`;
    });
    message += `----------------------\n`;
  });

  return message.trim();
}

module.exports = { parseWeatherData, formatWeatherMessage };