// weather_parser.js
// weather_parser.js

function parseWeatherData(jsonData, locationName) {
  if (!jsonData || !jsonData.records) {
    console.error("[API 回傳異常] 實際收到的資料：", JSON.stringify(jsonData));
    throw new Error('氣象署 API 連線異常，請查看伺服器日誌。');
  }

  const countyArray = jsonData.records.Locations;
  if (!countyArray || countyArray.length === 0) {
    console.error("[資料結構錯誤] 實際的 records 內容：", JSON.stringify(jsonData.records).substring(0, 300));
    throw new Error('氣象署回傳的資料結構中找不到 Locations 陣列。');
  }

  const locationsArray = countyArray[0].Location;
  const targetLocationData = locationsArray.find(loc => loc.LocationName === locationName);

  if (!targetLocationData) {
    throw new Error(`氣象資料庫中找不到「${locationName}」的資料。`);
  }

  const weatherElements = targetLocationData.WeatherElement;

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

  const getDateAndHour = (item) => {
    const timeStr = item.StartTime || item.DataTime;
    if (!timeStr) return null;
    const dateObj = new Date(timeStr);
    const dateStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const hour = parseInt(dateObj.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Taipei', hour: '2-digit' }), 10);
    return { dateStr, hour };
  };

  tData.forEach(item => {
    const dh = getDateAndHour(item);
    if (!dh) return;
    const slot = getSlot(dh.hour);
    if (!slot) return;
    const day = getOrCreateDay(dh.dateStr);
    const rawVal = extractValue(item);
    if (rawVal !== null) {
      const temp = parseInt(rawVal, 10);
      if (!isNaN(temp)) {
        if (day[slot].minT == null || temp < day[slot].minT) day[slot].minT = temp;
        if (day[slot].maxT == null || temp > day[slot].maxT) day[slot].maxT = temp;
      }
    }
  });

  rhData.forEach(item => {
    const dh = getDateAndHour(item);
    if (!dh) return;
    const slot = getSlot(dh.hour);
    if (!slot) return;
    const day = getOrCreateDay(dh.dateStr);
    const rawVal = extractValue(item);
    if (rawVal !== null) {
      const rh = parseInt(rawVal, 10);
      if (!isNaN(rh)) {
        day[slot].rhSum += rh;
        day[slot].rhCount += 1;
      }
    }
  });

  popData.forEach(item => {
    const dh = getDateAndHour(item);
    if (!dh) return;
    const slot = getSlot(dh.hour);
    if (!slot) return;
    const day = getOrCreateDay(dh.dateStr);
    const rawVal = extractValue(item);
    if (rawVal !== null && rawVal !== ' ' && rawVal !== '-' && rawVal !== '-1') {
      day[slot].pop = rawVal;
    }
  });

  return Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
}

const SLOT_ORDER = [
  { key: 'morning', name: '早上' },
  { key: 'noon', name: '中午' },
  { key: 'night', name: '晚上' },
];

// 「早上」「早上及中午」「早上、中午及晚上」
function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return names.slice(0, -1).join('、') + '及' + names[names.length - 1];
}

function rangeText(vals) {
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  return mn === mx ? `${mx}%` : `${mn}～${mx}%`;
}

// 降雨分析
function describeRain(day) {
  const slots = SLOT_ORDER
    .map(s => ({ name: s.name, v: parseInt(day[s.key].pop, 10) }))
    .filter(s => !isNaN(s.v));
  if (slots.length === 0) return '';

  const vals = slots.map(s => s.v);
  const max = Math.max(...vals);
  const min = Math.min(...vals);

  if (max < 20) return '降雨機率低，天氣大致穩定。';
  if (max < 40) return `降雨機率偏低（最高 ${max}%），僅有零星短暫降雨的可能。`;

  // 全天都偏高
  if (min >= 50) {
    const high = slots.filter(s => s.v >= 70);
    const rest = slots.filter(s => s.v < 70);
    if (high.length === 0) {
      return `整日有雨，降雨機率約 ${rangeText(vals)}，外出請攜帶雨具。`;
    }
    if (rest.length === 0) {
      return `整日陰雨天氣，降雨機率達 ${rangeText(vals)}，外出請攜帶雨具。`;
    }
    return `整日陰雨天氣，${joinNames(high.map(s => s.name))}降雨機率達 ${rangeText(high.map(s => s.v))}，` +
      `${joinNames(rest.map(s => s.name))}降雨稍減（${rangeText(rest.map(s => s.v))}），但仍有降雨可能。`;
  }

  // 前段穩定、中段有雨、後段減緩
  let i = 0;
  while (i < slots.length && slots[i].v < 30) i++;
  let j = slots.length;
  while (j > i && slots[j - 1].v < 30) j--;
  const lead = slots.slice(0, i);
  const mid = slots.slice(i, j);
  const trail = slots.slice(j);

  const midVals = mid.map(s => s.v);
  const midMax = Math.max(...midVals);
  let phrase = '，可能有短暫降雨';
  if (midMax >= 70) phrase = '，可能出現持續性或間歇性降雨';
  else if (midMax >= 50) phrase = '，可能出現局部陣雨';

  let text = '';
  if (lead.length) text += `${joinNames(lead.map(s => s.name))}降雨機率低、天氣相對穩定；`;
  text += `${joinNames(mid.map(s => s.name))}降雨機率 ${rangeText(midVals)}${phrase}`;
  if (trail.length) text += `，${joinNames(trail.map(s => s.name))}降雨減緩`;
  return text + '。';
}

// 溫度、濕度分析
function describeTemp(day, prevDay) {
  const temps = SLOT_ORDER
    .map(s => day[s.key])
    .filter(d => d.minT != null && d.maxT != null);
  if (temps.length === 0) return '';

  const allMin = Math.min(...temps.map(d => d.minT));
  const allMax = Math.max(...temps.map(d => d.maxT));
  const avg = (allMin + allMax) / 2;

  let level = '炎熱';
  if (avg < 16) level = '偏冷';
  else if (avg < 23) level = '偏涼';
  else if (avg < 28) level = '舒適';
  else if (avg < 32) level = '偏熱';

  // 平均濕度
  let rhSum = 0, rhCount = 0;
  SLOT_ORDER.forEach(s => {
    rhSum += day[s.key].rhSum;
    rhCount += day[s.key].rhCount;
  });
  const rh = rhCount > 0 ? rhSum / rhCount : null;

  // 與前一日比較
  let trend = '';
  if (prevDay) {
    const prevTemps = SLOT_ORDER
      .map(s => prevDay[s.key])
      .filter(d => d.maxT != null);
    if (prevTemps.length) {
      const prevMax = Math.max(...prevTemps.map(d => d.maxT));
      if (allMax - prevMax >= 2) trend = '氣溫較前一日回升';
      else if (allMax - prevMax <= -2) trend = '氣溫較前一日下降';
    }
  }

  const parts = [`氣溫${level}，最高 ${allMax}°C`];
  if (trend) parts.push(trend);

  const spread = allMax - allMin;
  if (spread <= 3) parts.push('日夜溫差小');
  else if (spread >= 7) parts.push('日夜溫差大，早晚請留意增減衣物');

  if (rh !== null) {
    if (rh >= 90) parts.push('空氣濕度極高');
    else if (rh >= 80) parts.push('濕度偏高');
    else if (rh >= 70) parts.push('空氣偏潮濕');
    else if (rh < 55) parts.push('空氣偏乾');

    if (avg < 23 && rh >= 85) parts.push('體感濕冷');
    else if (avg >= 28 && rh >= 75) parts.push('體感悶熱');
  }

  return parts.join('，') + '。';
}

function analyzeDay(day, prevDay) {
  return describeRain(day) + describeTemp(day, prevDay);
}

function formatWeatherMessage(locationKey, daysData) {
  if (daysData.length === 0) {
    return `📍 ${locationKey} 目前無法解析出有效的預報區間。`;
  }

  let message = `📍 ${locationKey} 未來三日天氣預報\n`;
  message += `(資料更新時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })})\n\n`;

  daysData.forEach((day, index) => {
    message += `📅 ${day.date}\n`;

    const analysis = analyzeDay(day, daysData[index - 1]);
    if (analysis) message += `${analysis}\n`;

    SLOT_ORDER.forEach(slot => {
      const d = day[slot.key];
      const t = (d.minT != null && d.maxT != null) ? `${d.minT}~${d.maxT}°C` : '無資料';
      const rh = d.rhCount > 0 ? `${Math.round(d.rhSum / d.rhCount)}%` : '無資料';
      const pop = d.pop ? `${d.pop}%` : '無資料';

      message += `[${slot.name}] 氣溫:${t} | 濕度:${rh} | 降雨:${pop}\n`;
    });
    message += `----------------------\n`;
  });

  return message.trim();
}

module.exports = { parseWeatherData, formatWeatherMessage };

