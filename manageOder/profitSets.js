const { getBuyTakeProfit, getBuyStoploss, 
    getSellTakeProfit, getSellStoploss,
    cancelOrder } = require('./Trade.js');
const { color } = require('../setting/config.js')
const { GetTickPriceBtc } = require('./TickPriceBTC.js') ;
const { binance, client } = require('../index.js');

let isWaiting = false ;

async function checkBuy(){
    const BuyTakeProfit = await getBuyTakeProfit();
    const BuyStoploss = await getBuyStoploss();
    const btcPrice = await GetTickPriceBtc() ;
    if (btcPrice >= BuyTakeProfit && BuyTakeProfit !== null && !isWaiting) {
        isWaiting = true;
        await cancelOrder(binance, btcPrice, client, 'Buy TakeProfit Successful!', color.colorGreen)
        isWaiting = false;
    } else if (btcPrice <= BuyStoploss && BuyStoploss !== null && !isWaiting) {
        isWaiting = true;
        await cancelOrder(binance, btcPrice, client, 'Buy StopLoss Successful!', color.colorRed)
        isWaiting = false;
    }
}

async function checkSell(){
    const SellTakeProfit = await getSellTakeProfit();
    const SellStoploss = await getSellStoploss();
    const btcPrice = await GetTickPriceBtc() ;
    if (btcPrice <= SellTakeProfit && SellTakeProfit !== null && !isWaiting) {
        isWaiting = true;
        await cancelOrder(binance, btcPrice, client, 'Sell TakeProfit Successful!', color.colorGreen)
        isWaiting = false;
    } else if (btcPrice >= SellStoploss && SellStoploss !== null && !isWaiting) {
        isWaiting = true;
        await cancelOrder(binance, btcPrice, client, 'Sell StopLoss Successful!', color.colorRed)
        isWaiting = false;
    }
}

module.exports = {
    checkBuy : checkBuy,
    checkSell : checkSell,
}