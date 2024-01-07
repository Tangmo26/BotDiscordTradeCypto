const axios = require('axios');
const { risk } = require('../setting/config')

const symbol = 'BTCUSDT'
const baseUrl = 'https://fapi.binance.com';
const endpoint = '/fapi/v1/ticker/price';
const endpoint2 = '/fapi/v1/klines';
const params = { symbol };

let btcPrice = null;

const headers = {
  'X-MBX-APIKEY': process.env.APIKEY,
};

const requestConfig = {
  baseURL: baseUrl,
  url: endpoint,
  method: 'GET',
  params,
  headers,
};


async function GetTickPriceBtc() {
  await axios(requestConfig)
    .then(response => {
      const lastPrice = parseFloat(response.data.price);
      btcPrice = lastPrice;
    })
    .catch(error => {
      console.error('Error fetching last price:', error.message);
    });
  return btcPrice;
}


async function getStopAndTake(order) {
  const interval = '5m';
  const limit = 11;

  const params = {
    symbol,
    interval,
    limit,
  };

  const requestConfig = {
    baseURL: baseUrl,
    url: endpoint2,
    method: 'GET',
    params: params,
    headers,
  };

  try {
    const response = await axios(requestConfig);
    const klines = response.data;
    let arrayPrice = [];
    if (order === 'sell') {
      for (i = 0; i < 10; i++) {
        arrayPrice.push(parseFloat(klines[i][2]));
        var higher = Math.max(...arrayPrice);
      }
      const close = (parseFloat(klines[10][1]));
      let stopLoss = close + Math.abs(higher - close)
      let takeProfit = close - Math.abs(higher - close) * risk
      // if ((((Math.abs(higher - close) + close) / close) - 1) * 100 > 0.8) {
      //   stopLoss = close * (1 + (0.55 / 100));
      // }
      return [stopLoss, takeProfit];
    }
    else if (order === 'buy') {
      for (i = 0; i < 10; i++) {
        arrayPrice.push(parseFloat(klines[i][3]));
        var lower = Math.min(...arrayPrice);
      }
      const close = (parseFloat(klines[10][1]));
      let stopLoss = close - Math.abs(lower - close);
      let takeProfit = close + Math.abs(lower - close) * risk;
      // if ((((Math.abs(lower - close) + close) / close) - 1) * 100 > 0.8) {
      //   stopLoss = close * (1 - (0.55 / 100));
      // }
      return [stopLoss, takeProfit];
    }
  } catch (error) {
    console.error('Error fetching Klines:', error.message);
    throw error;
  }
}

module.exports = {
  GetTickPriceBtc: GetTickPriceBtc,
  getStopAndTake: getStopAndTake,
}