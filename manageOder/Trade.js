const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./Database');
const { leverage } = require('../setting/config');
const { GetTickPriceBtc, getStopAndTake } = require('./TickPriceBTC') ;

const gifanya = [
  `https://media.tenor.com/YTVzMpGOKLwAAAAd/spy-x-family-anya-forger.gif`,
  `https://media.tenor.com/MATwEVDbipYAAAAd/anya.gif`,
  `https://media.tenor.com/wHvB3ZCH6egAAAAC/yor-anya-yor-forger.gif`,
  `https://media.tenor.com/0qj0aqZ0nucAAAAC/anya-spy-x-family-anime-anya-crying.gif`,
  `https://media.tenor.com/6ndm0Avg93MAAAAC/spy-x-family-anya.gif`,
  `https://media.tenor.com/SEEMSDLdDugAAAAd/anya-forger.gif`,
  `https://media.tenor.com/f_EOn4JhDZUAAAAC/anya-forger-smile.gif`,
  `https://media.tenor.com/lpn1paLNvo4AAAAC/anya-forger-anya.gif`,
  `https://media.tenor.com/LVx85PQ6ZzkAAAAC/anya-sad.gif`,
  `https://media.tenor.com/cYeZje7yWVkAAAAC/anya-anya-heh.gif`,
  `https://media.tenor.com/SpfuEws8HfEAAAAC/anya-spy-x-family-shock.gif`
]

const colorGreen = "#9AD5BF"
const colorRed = "#F97C7C"
let Myprice = null
let BuyTakeProfit = null
let BuyStoploss = null
let SellTakeProfit = null
let SellStoploss = null
let Buy = false
let Sell = false
let TimePrevious = 0 ;
let BuySellTakeProfit = null

async function variableCheck() {
  if (localStorage.getItem('Buy') && localStorage.getItem('BuyTakeProfit') && localStorage.getItem('BuyStoploss')
    && localStorage.getItem('Sell') && localStorage.getItem('SellTakeProfit') && localStorage.getItem('SellStoploss') && localStorage.getItem('Myprice') && localStorage.getItem('TimePrevious')) {
    await setMyprice() ;
    console.log('already have Database');
  }
  else {
    localStorage.setItem('Buy', JSON.stringify(Buy));
    localStorage.setItem('Sell', JSON.stringify(Sell));
    localStorage.setItem('BuyTakeProfit', JSON.stringify(BuyTakeProfit));
    localStorage.setItem('BuyStoploss', JSON.stringify(BuyStoploss));
    localStorage.setItem('SellTakeProfit', JSON.stringify(SellTakeProfit));
    localStorage.setItem('SellStoploss', JSON.stringify(SellStoploss));
    localStorage.setItem('Myprice', JSON.stringify(Myprice));
    localStorage.setItem('TimePrevious', JSON.stringify(TimePrevious))
    console.log('dont have')
  }
}

//set
async function setBuy(value) {
  Buy = value;
  localStorage.setItem('Buy', JSON.stringify(Buy));
}
async function setSell(value) {
  Sell = value;
  localStorage.setItem('Sell', JSON.stringify(Sell));
}
async function setBuyTakeProfit(value) {
  BuyTakeProfit = value;
  localStorage.setItem('BuyTakeProfit', JSON.stringify(BuyTakeProfit));
}
async function setBuyStoploss(value) {
  BuyStoploss = value;
  localStorage.setItem('BuyStoploss', JSON.stringify(BuyStoploss));
}
async function setSellTakeProfit(value) {
  SellTakeProfit = value;
  localStorage.setItem('SellTakeProfit', JSON.stringify(SellTakeProfit));
}
async function setSellStoploss(value) {
  SellStoploss = value;
  localStorage.setItem('SellStoploss', JSON.stringify(SellStoploss));
}


async function setMyprice() {
  Myprice = await JSON.parse(localStorage.getItem('Myprice'));
}
async function getMyprice() {
  return Myprice ;
}


//get
async function getBuy() {
  Buy = await JSON.parse(localStorage.getItem('Buy'));
  return Buy;
}
async function getSell() {
  Sell = await JSON.parse(localStorage.getItem('Sell'));
  return Sell;
}
async function getBuyTakeProfit() {
  BuyTakeProfit = await JSON.parse(localStorage.getItem('BuyTakeProfit'));
  return BuyTakeProfit;
}
async function getBuyStoploss() {
  BuyStoploss = await JSON.parse(localStorage.getItem('BuyStoploss'));
  return BuyStoploss;
}
async function getSellTakeProfit() {
  SellTakeProfit = await JSON.parse(localStorage.getItem('SellTakeProfit'));
  return SellTakeProfit;
}
async function getSellStoploss() {
  SellStoploss = await JSON.parse(localStorage.getItem('SellStoploss'));
  return SellStoploss;
}

///////////////TimePrevious/////////////////
async function setTimePrevious(value){
  TimePrevious = await JSON.parse(localStorage.getItem('TimePrevious'));
  TimePrevious += value
  localStorage.setItem('TimePrevious', JSON.stringify(parseFloat(TimePrevious.toFixed(7))));
}
async function getTimePrevious(){
  TimePrevious = await JSON.parse(localStorage.getItem('TimePrevious'));
  return TimePrevious ;
}
async function setDefTime(value){
  TimePrevious = value ;
  localStorage.setItem('TimePrevious', JSON.stringify(TimePrevious));
}
///////////////TimePrevious/////////////////

async function setBuySellTakeProfit(value){
  BuySellTakeProfit = value ;
  localStorage.setItem('BuySellTakeProfit', JSON.stringify(BuySellTakeProfit)) ;
}
async function getBuySellTakeProfit(){
  BuySellTakeProfit = await JSON.parse(localStorage.getItem('BuySellTakeProfit')) ;
  return BuySellTakeProfit ;
}

const channelID = process.env.CHANNEL_ID

async function tradeBuy(binance, client) {
  const channel = client.channels.cache.get(channelID);
  try {
    
    //กำหนดค่าต่างๆ
    const accountInfo = await binance.futuresAccount();
    const usdtBalance = parseFloat(accountInfo.totalWalletBalance) ;

    Myprice = usdtBalance ;
    localStorage.setItem('Myprice', JSON.stringify(Myprice));

    //const btcPrice = await binance.futuresMarkPrice('BTCUSDT');
    const BtcPriceValue = await GetTickPriceBtc() ;
    //จำนวนเงินที่เข้าซื้อ
    const investmentAmount = usdtBalance * 0.5;
    const BuyOrder = parseFloat(((investmentAmount * leverage) / parseFloat(BtcPriceValue)).toFixed(3));
    //เริ่มการเทรด
    await binance.futuresLeverage('BTCUSDT', leverage);
    const order = await binance.futuresMarketBuy('BTCUSDT', BuyOrder);
    //console.log(order)
    if (order.msg !== null && typeof order.msg !== 'undefined') {
      channel.send('คำสั่งซื้อล้มเหลวเนื่องจาก ' + order.msg)
      console.log(BuyOrder)
    } else {
      // [BuyStoploss, BuyTakeProfit] = await getStopAndTake('buy') ;
      BuyStoploss = BtcPriceValue * 0.090
      BuyTakeProfit = BtcPriceValue * 1.025
      Buy = true;
      Sell = false;
      // BuyTakeProfit = parseFloat((parseFloat(BtcPriceValue) * 1.005).toFixed(2));
      // BuyStoploss = parseFloat((parseFloat(BtcPriceValue) * 0.996).toFixed(2));
      localStorage.setItem('BuyTakeProfit', JSON.stringify(BuyTakeProfit));
      localStorage.setItem('BuyStoploss', JSON.stringify(BuyStoploss));
      localStorage.setItem('Buy', JSON.stringify(Buy));
      localStorage.setItem('Sell', JSON.stringify(Sell));
      const gifrandom = gifanya[Math.floor(Math.random() * gifanya.length)]
      const currentDate = moment().tz('Asia/Bangkok');
      const currentDateTime = currentDate.format('DD/MM/YYYY, HH:mm:ss');
      const messageBuy = `เวลา : ${currentDateTime} นาฬิกา
      สถานะ : BUY 🟢
      เงินที่เหลือ : ${usdtBalance.toFixed(2)} USDT
      จำนวนเงินที่ลง : ${(BuyOrder * parseFloat(BtcPriceValue) / leverage).toFixed(2)} USDT
      ราคาที่เข้า : ${(parseFloat(BtcPriceValue)).toFixed(2)} USDT
      TakeProfit : ${BuyTakeProfit} USDT
      StopLoss : ${BuyStoploss} USDT`
      
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🪙 BTCUSDTPERP`)
            .setColor(colorGreen)
            .setDescription(messageBuy.substring(0, 3000))
            .setImage(
              message.guild.banner
                ? message.guild.bannerURL({ size: 4096 })
                : gifrandom
            )
        ]
      })

      BuySellTakeProfit = BuyTakeProfit ;
      localStorage.setItem('BuySellTakeProfit', JSON.stringify(BuySellTakeProfit)) ;
    }
  } catch (error) {
    console.log(error)
    channel.send('คำสั่งซื้อไม่สำเร็จ')
  }
}

async function tradeSell(binance, client) {
  const channel = client.channels.cache.get(channelID);
  try {
    //กำหนดค่าต่างๆ
    const accountInfo = await binance.futuresAccount();
    const usdtBalance = parseFloat(accountInfo.totalWalletBalance);

    Myprice = usdtBalance;
    localStorage.setItem('Myprice', JSON.stringify(Myprice));
    
    //const btcPrice = await binance.futuresMarkPrice('BTCUSDT');
    const BtcPriceValue = await GetTickPriceBtc() ;
    //จำนวนเงินที่เข้าขาย
    const investmentAmount = usdtBalance * 0.5;
    const SellOrder = parseFloat(((investmentAmount * leverage) / parseFloat(BtcPriceValue)).toFixed(3));
    //เริ่มการเทรด
    await binance.futuresLeverage('BTCUSDT', leverage);
    const order = await binance.futuresMarketSell('BTCUSDT', SellOrder);
    //console.log(order)
    if (order.msg !== null && typeof order.msg !== 'undefined') {
      channel.send('คำสั่งขายล้มเหลวเนื่องจาก ' + order.msg)
    } else {
      // [SellStoploss, SellTakeProfit] = await getStopAndTake('sell') ;
      SellStoploss = BtcPriceValue * 0.010
      SellTakeProfit = BtcPriceValue * 0.975
      Sell = true;
      Buy = false;
      // SellTakeProfit = parseFloat((parseFloat(BtcPriceValue) * 0.995).toFixed(2));
      // SellStoploss = parseFloat((parseFloat(BtcPriceValue) * 1.004).toFixed(2));
      localStorage.setItem('SellTakeProfit', JSON.stringify(SellTakeProfit));
      localStorage.setItem('SellStoploss', JSON.stringify(SellStoploss));
      localStorage.setItem('Buy', JSON.stringify(Buy));
      localStorage.setItem('Sell', JSON.stringify(Sell));
      const gifrandom = gifanya[Math.floor(Math.random() * gifanya.length)]
      const currentDate = moment().tz('Asia/Bangkok');
      const currentDateTime = currentDate.format('DD/MM/YYYY, HH:mm:ss');
      const messageSell = `เวลา : ${currentDateTime} นาฬิกา
      สถานะ : SELL 🔴
      เงินที่เหลือ : ${usdtBalance.toFixed(2)} USDT
      จำนวนเงินที่ลง : ${(SellOrder * parseFloat(BtcPriceValue) / leverage).toFixed(2)} USDT
      ราคาที่เข้า : ${(parseFloat(BtcPriceValue)).toFixed(2)} USDT
      TakeProfit : ${SellTakeProfit} USDT
      StopLoss : ${SellStoploss} USDT`
      
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🪙 BTCUSDTPERP`)
            .setColor(colorRed)
            .setDescription(messageSell.substring(0, 3000))
            .setImage(
              message.guild.banner
                ? message.guild.bannerURL({ size: 4096 })
                : gifrandom
            )
        ]
      })

      BuySellTakeProfit = SellTakeProfit ;
      localStorage.setItem('BuySellTakeProfit', JSON.stringify(BuySellTakeProfit)) ;
    }
  } catch (error) {
    console.log(error)
    channel.send('คำสั่งขายไม่สำเร็จ')
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cancelOrder(binance, btcprice, client, message, color) {
  let count = 0
  BuyTakeProfit = null
  BuyStoploss = null
  SellTakeProfit = null
  SellStoploss = null
  Buy = false;
  Sell = false;
  BuySellTakeProfit = null ;
  localStorage.setItem('Buy', JSON.stringify(Buy));
  localStorage.setItem('Sell', JSON.stringify(Sell));
  localStorage.setItem('BuyTakeProfit', JSON.stringify(BuyTakeProfit));
  localStorage.setItem('BuyStoploss', JSON.stringify(BuyStoploss));
  localStorage.setItem('SellTakeProfit', JSON.stringify(SellTakeProfit));
  localStorage.setItem('SellStoploss', JSON.stringify(SellStoploss));
  localStorage.setItem('BuySellTakeProfit', JSON.stringify(BuySellTakeProfit)) ;
  try {
    const channel = client.channels.cache.get(channelID);
    const accountInfo = await binance.futuresAccount();
    const usdBalanceCapital = parseFloat(accountInfo.totalWalletBalance);
    for (const position of accountInfo.positions) {
      if (position.symbol === 'BTCUSDT') {
        if (position.positionAmt > 0) {
          await binance.futuresMarketSell('BTCUSDT', position.positionAmt);
          count = count + 1
        } else if (position.positionAmt < 0) {
          await binance.futuresMarketBuy('BTCUSDT', Math.abs(position.positionAmt));
          count = count + 1
        }
      }
    }
    await wait(3000);
    const accountInfo2 = await binance.futuresAccount();
    const usdtBalance = parseFloat(accountInfo2.totalWalletBalance);
    if (message === 'all') {
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`Cancel all position successfully ได้ทำการออก ${count} position`)
        ]
      });
      console.log('closse all position successfully')
    } else if (message === 'first') {
      if (count !== 0) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(color)
              .setDescription(`Bot reset ได้ทำการออก ${count} position
              My Price current : ${usdtBalance.toFixed(2)} USDT
              Profit Price : ${(usdtBalance - usdBalanceCapital).toFixed(2)} USDT
              Profit Per : ${((usdtBalance - usdBalanceCapital) / usdBalanceCapital * 100).toFixed(2)} %`)
          ]
        });
      }
      console.log('first closse all position successfully')
    } else {
      if (Myprice === null) {
        Myprice = usdBalanceCapital;
      }
      channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setDescription(`${message} ที่ราคา btc : ${btcprice} USDT
            My Price past : ${Myprice.toFixed(2)} USDT
            My Price current : ${usdtBalance.toFixed(2)} USDT
            Profit Price : ${(usdtBalance - Myprice).toFixed(2)} USDT
            Profit per : ${((usdtBalance - Myprice) / Myprice * 100).toFixed(2)} %`)
        ]
      });
      Myprice = null;
      localStorage.setItem('Myprice', JSON.stringify(Myprice));

      console.log('Custom close position successfully')
    }
  } catch (error) {
    console.error('Error closing positions:', error);
  }
}

async function checkFalseBuySell(client, binance) {
  try {
    let countBuy = 0;
    let countSell = 0;
    const channel = client.channels.cache.get(channelID);
    const accountInfo = await binance.futuresAccount();
    for (const position of accountInfo.positions) {
      if (position.symbol === 'BTCUSDT') {
        if (position.positionAmt > 0) {
          countBuy = countBuy + 1
        } else if (position.positionAmt < 0) {
          countSell = countSell + 1
        }
      }
    }
    if ((countBuy > 0 && Buy === false) || (countSell > 0 && Sell === false) || (countBuy === 0 && Buy === true) || (countSell === 0 && Sell === true)) {
      if (countBuy > 0 || countSell > 0) {
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(colorRed)
              .setDescription(`position มีการเข้า order จำนวน ${countBuy + countSell} order 
              โดยไม่ได้รับอนุญาตโปรดตรวจสอบบัญชีของคุณ
              Buy = ${Buy}
              Sell = ${Sell}`)
          ]
        });
        console.log('position > 0 have problem')
      }
      else {
        Buy = false;
        Sell = false;
        BuyTakeProfit = null;
        BuyStoploss = null;
        SellTakeProfit = null;
        SellStoploss = null;
        Myprice = null;
        BuySellTakeProfit = null ;
        localStorage.setItem('Buy', JSON.stringify(Buy));
        localStorage.setItem('Sell', JSON.stringify(Sell));
        localStorage.setItem('BuyTakeProfit', JSON.stringify(BuyTakeProfit));
        localStorage.setItem('BuyStoploss', JSON.stringify(BuyStoploss));
        localStorage.setItem('SellTakeProfit', JSON.stringify(SellTakeProfit));
        localStorage.setItem('SellStoploss', JSON.stringify(SellStoploss));
        localStorage.setItem('Myprice', JSON.stringify(Myprice));
        localStorage.setItem('BuySellTakeProfit', JSON.stringify(BuySellTakeProfit)) ;

        channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(colorRed)
              .setDescription(`set default value Succellfull!`)
          ]
        });
        console.log('reset Succellfull');
      }
      console.log('position have problem');
    }
    else {
      console.log('position dont have problem');
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  tradeBuy: tradeBuy,
  tradeSell: tradeSell,
  cancelOrder: cancelOrder,
  getBuy: getBuy,
  getSell: getSell,
  getBuyTakeProfit: getBuyTakeProfit,
  getBuyStoploss: getBuyStoploss,
  getSellTakeProfit: getSellTakeProfit,
  getSellStoploss: getSellStoploss,
  setBuy: setBuy,
  setSell: setSell,
  setBuyTakeProfit: setBuyTakeProfit,
  setBuyStoploss: setBuyStoploss,
  setSellTakeProfit: setSellTakeProfit,
  setSellStoploss: setSellStoploss,
  variableCheck: variableCheck,
  checkFalseBuySell: checkFalseBuySell,
  setMyprice: setMyprice,
  getMyprice: getMyprice,
  setTimePrevious : setTimePrevious,
  getTimePrevious : getTimePrevious,
  setDefTime : setDefTime,
  setBuySellTakeProfit : setBuySellTakeProfit,
  getBuySellTakeProfit : getBuySellTakeProfit,
};