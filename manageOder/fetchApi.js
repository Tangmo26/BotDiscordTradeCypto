const DataFrame = require('dataframe-js').DataFrame;
const moment = require('moment');

async function fetchPythonAPI() {
    const response = await fetch('http://localhost:8080/get_btcusd15m');
    const data = await response.json();
    return data;
}

async function fetchData() {
    try {
        const apiData = await fetchPythonAPI();
        if ('sell_btc15min' in apiData) {
            const sellData = JSON.parse(apiData.sell_btc15min);
            const timeArray = sellData.map(entry => entry.time);
            const resultArray = sellData.map(entry => entry.result);
            // console.log("Sell BTC 15min Time Array:", timeArray[0]);
            // console.log("Sell BTC 15min Result Array:", resultArray[0]);
            return timeArray[0], resultArray[0], "sell"
        } else if ('buy_btc15min' in apiData) {
            const buyData = JSON.parse(apiData.buy_btc15min);
            const timeArray = buyData.map(entry => entry.time);
            const resultArray = buyData.map(entry => entry.result);
            // console.log("Buy BTC 15min Time Array:", timeArray[0]);
            // console.log("Buy BTC 15min Result Array:", resultArray[0]);
            return timeArray[0], resultArray[0], "buy"
        } else if ('non_btc15min' in apiData) {
            const nonBtcData = JSON.parse(apiData.non_btc15min);
            const timeArray = nonBtcData.map(entry => entry.time);
            const resultArray = nonBtcData.map(entry => entry.result);
            // console.log("Non-BTC 15min Time Array:", timeArray[0]);
            // console.log("Non-BTC 15min Result Array:", resultArray[0]);
            return timeArray[0], resultArray[0], "non"
        } else {
            console.log("Unknown data key in API response");
        }
    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}

// Function to check if the current time is within the allowed interval
function isAllowedTime() {
    const currentMinute = new Date().getMinutes();
    const sec = new Date().getSeconds();
    return currentMinute % 15 === 0 && currentMinute % 60 !== 0 && sec === 0;
}

module.exports = {
    fetchPythonAPI : fetchPythonAPI,
    fetchData : fetchData,
    isAllowedTime : isAllowedTime
}