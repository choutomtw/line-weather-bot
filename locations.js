// 氣象署 F-D0047-XXX 全台各縣市鄉鎮 API ID 對照表
// 001:宜蘭縣 | 005:桃園市 | 009:新竹縣 | 013:苗栗縣 | 017:彰化縣 | 021:南投縣
// 025:雲林縣 | 029:嘉義縣 | 033:屏東縣 | 037:臺東縣 | 041:花蓮縣 | 045:澎湖縣
// 049:基隆市 | 053:新竹市 | 057:嘉義市 | 061:臺北市 | 065:高雄市 | 069:新北市
// 073:臺中市 | 077:臺南市 | 081:連江縣 | 085:金門縣

const locationMapping = {
  // === 臺北市 (061) ===
  '信義': { apiId: 'F-D0047-061', realName: '信義區' },
  '信義區': { apiId: 'F-D0047-061', realName: '信義區' },
  '大安': { apiId: 'F-D0047-061', realName: '大安區' },
  '大安區': { apiId: 'F-D0047-061', realName: '大安區' },
  '中山': { apiId: 'F-D0047-061', realName: '中山區' },
  '中山區': { apiId: 'F-D0047-061', realName: '中山區' },
  '中正': { apiId: 'F-D0047-061', realName: '中正區' },
  '中正區': { apiId: 'F-D0047-061', realName: '中正區' },

  // === 新北市 (069) ===
  '板橋': { apiId: 'F-D0047-069', realName: '板橋區' },
  '板橋區': { apiId: 'F-D0047-069', realName: '板橋區' },
  '中和': { apiId: 'F-D0047-069', realName: '中和區' },
  '中和區': { apiId: 'F-D0047-069', realName: '中和區' },
  '淡水': { apiId: 'F-D0047-069', realName: '淡水區' },
  '淡水區': { apiId: 'F-D0047-069', realName: '淡水區' },

  // === 桃園市 (005) ===
  '桃園': { apiId: 'F-D0047-005', realName: '桃園區' },
  '桃園區': { apiId: 'F-D0047-005', realName: '桃園區' },
  '中壢': { apiId: 'F-D0047-005', realName: '中壢區' },
  '中壢區': { apiId: 'F-D0047-005', realName: '中壢區' },

  // === 臺中市 (073) - 重名區已加上前綴防呆 ===
  '西屯': { apiId: 'F-D0047-073', realName: '西屯區' },
  '西屯區': { apiId: 'F-D0047-073', realName: '西屯區' },
  '南屯': { apiId: 'F-D0047-073', realName: '南屯區' },
  '南屯區': { apiId: 'F-D0047-073', realName: '南屯區' },
  '北屯': { apiId: 'F-D0047-073', realName: '北屯區' },
  '北屯區': { apiId: 'F-D0047-073', realName: '北屯區' },
  '太平': { apiId: 'F-D0047-073', realName: '太平區' },
  '太平區': { apiId: 'F-D0047-073', realName: '太平區' },
  '台中西區': { apiId: 'F-D0047-073', realName: '西區' },
  '臺中西區': { apiId: 'F-D0047-073', realName: '西區' },
  '台中南區': { apiId: 'F-D0047-073', realName: '南區' },
  '臺中南區': { apiId: 'F-D0047-073', realName: '南區' },
  '台中北區': { apiId: 'F-D0047-073', realName: '北區' },
  '臺中北區': { apiId: 'F-D0047-073', realName: '北區' },
  '台中中區': { apiId: 'F-D0047-073', realName: '中區' },
  '臺中中區': { apiId: 'F-D0047-073', realName: '中區' },
  '台中東區': { apiId: 'F-D0047-073', realName: '東區' },
  '臺中東區': { apiId: 'F-D0047-073', realName: '東區' },

  // === 彰化縣 (017) ===
  '彰化': { apiId: 'F-D0047-017', realName: '彰化市' },
  '彰化市': { apiId: 'F-D0047-017', realName: '彰化市' },
  '員林': { apiId: 'F-D0047-017', realName: '員林市' },
  '員林市': { apiId: 'F-D0047-017', realName: '員林市' },
  '鹿港': { apiId: 'F-D0047-017', realName: '鹿港鎮' },
  '鹿港鎮': { apiId: 'F-D0047-017', realName: '鹿港鎮' },

  // === 臺南市 (077) - 重名區已加上前綴防呆 ===
  '永康': { apiId: 'F-D0047-077', realName: '永康區' },
  '永康區': { apiId: 'F-D0047-077', realName: '永康區' },
  '安平': { apiId: 'F-D0047-077', realName: '安平區' },
  '安平區': { apiId: 'F-D0047-077', realName: '安平區' },
  '中西區': { apiId: 'F-D0047-077', realName: '中西區' },
  '台南東區': { apiId: 'F-D0047-077', realName: '東區' },
  '臺南東區': { apiId: 'F-D0047-077', realName: '東區' },
  '台南南區': { apiId: 'F-D0047-077', realName: '南區' },
  '臺南南區': { apiId: 'F-D0047-077', realName: '南區' },
  '台南北區': { apiId: 'F-D0047-077', realName: '北區' },
  '臺南北區': { apiId: 'F-D0047-077', realName: '北區' },

  // === 高雄市 (065) ===
  '左營': { apiId: 'F-D0047-065', realName: '左營區' },
  '左營區': { apiId: 'F-D0047-065', realName: '左營區' },
  '旗津': { apiId: 'F-D0047-065', realName: '旗津區' },
  '旗津區': { apiId: 'F-D0047-065', realName: '旗津區' },
  '鼓山': { apiId: 'F-D0047-065', realName: '鼓山區' },
  '鼓山區': { apiId: 'F-D0047-065', realName: '鼓山區' },
  '三民': { apiId: 'F-D0047-065', realName: '三民區' },
  '三民區': { apiId: 'F-D0047-065', realName: '三民區' },
  '鳳山': { apiId: 'F-D0047-065', realName: '鳳山區' },
  '鳳山區': { apiId: 'F-D0047-065', realName: '鳳山區' },
  '前鎮': { apiId: 'F-D0047-065', realName: '前鎮區' },
  '前鎮區': { apiId: 'F-D0047-065', realName: '前鎮區' },
  '小港': { apiId: 'F-D0047-065', realName: '小港區' },
  '小港區': { apiId: 'F-D0047-065', realName: '小港區' },

  // === 屏東縣 (033) ===
  '屏東': { apiId: 'F-D0047-033', realName: '屏東市' },
  '屏東市': { apiId: 'F-D0047-033', realName: '屏東市' },
  '屏東市區': { apiId: 'F-D0047-033', realName: '屏東市' },
  '潮州': { apiId: 'F-D0047-033', realName: '潮州鎮' },
  '潮州鎮': { apiId: 'F-D0047-033', realName: '潮州鎮' },
  '恆春': { apiId: 'F-D0047-033', realName: '恆春鎮' },
  '恆春鎮': { apiId: 'F-D0047-033', realName: '恆春鎮' },
  '東港': { apiId: 'F-D0047-033', realName: '東港鎮' },
  '東港鎮': { apiId: 'F-D0047-033', realName: '東港鎮' },
  '小琉球': { apiId: 'F-D0047-033', realName: '琉球鄉' },
  '琉球': { apiId: 'F-D0047-033', realName: '琉球鄉' },
  '琉球鄉': { apiId: 'F-D0047-033', realName: '琉球鄉' },

  // === 宜蘭縣 (001) ===
  '蘇澳': { apiId: 'F-D0047-001', realName: '蘇澳鎮' },
  '蘇澳鎮': { apiId: 'F-D0047-001', realName: '蘇澳鎮' },
  '羅東': { apiId: 'F-D0047-001', realName: '羅東鎮' },
  '羅東鎮': { apiId: 'F-D0047-001', realName: '羅東鎮' },
  '礁溪': { apiId: 'F-D0047-001', realName: '礁溪鄉' },
  '礁溪鄉': { apiId: 'F-D0047-001', realName: '礁溪鄉' },

  // === 花蓮縣 (041) ===
  '花蓮': { apiId: 'F-D0047-041', realName: '花蓮市' },
  '花蓮市': { apiId: 'F-D0047-041', realName: '花蓮市' },
  '花蓮市區': { apiId: 'F-D0047-041', realName: '花蓮市' },
  '吉安': { apiId: 'F-D0047-041', realName: '吉安鄉' },
  '吉安鄉': { apiId: 'F-D0047-041', realName: '吉安鄉' },
  '壽豐': { apiId: 'F-D0047-041', realName: '壽豐鄉' },
  '壽豐鄉': { apiId: 'F-D0047-041', realName: '壽豐鄉' },
  '瑞穗': { apiId: 'F-D0047-041', realName: '瑞穗鄉' },
  '瑞穗鄉': { apiId: 'F-D0047-041', realName: '瑞穗鄉' },

  // === 臺東縣 (037) ===
  '台東': { apiId: 'F-D0047-037', realName: '臺東市' },
  '臺東': { apiId: 'F-D0047-037', realName: '臺東市' },
  '台東市': { apiId: 'F-D0047-037', realName: '臺東市' },
  '臺東市': { apiId: 'F-D0047-037', realName: '臺東市' },
  '綠島': { apiId: 'F-D0047-037', realName: '綠島鄉' },
  '綠島鄉': { apiId: 'F-D0047-037', realName: '綠島鄉' },
  '蘭嶼': { apiId: 'F-D0047-037', realName: '蘭嶼鄉' },
  '蘭嶼鄉': { apiId: 'F-D0047-037', realName: '蘭嶼鄉' },
  '池上': { apiId: 'F-D0047-037', realName: '池上鄉' },
  '池上鄉': { apiId: 'F-D0047-037', realName: '池上鄉' },

  // === 澎湖縣 (045) ===
  '馬公': { apiId: 'F-D0047-045', realName: '馬公市' },
  '馬公市': { apiId: 'F-D0047-045', realName: '馬公市' }
};

module.exports = { locationMapping };