const { EmbedBuilder } = require("discord.js");
const { setBuy, setSell, 
  setBuyTakeProfit, setBuyStoploss, 
  setSellTakeProfit, setSellStoploss,  
  setDefTime, tradeBuy,
  tradeSell, cancelOrder } = require('../manageOder/Trade.js');
const { GetTickPriceBtc, getStopAndTake } = require('../manageOder/TickPriceBTC.js')
const { color } = require('../setting/config.js')
const { binance, client } = require('../index.js');

client.on('messageCreate', async (message) => {
  try {
      if (message.channel.id !== process.env.CHANNEL_ID) return;
      if (message.content.startsWith('!Buy X50')) {
        await tradeBuy(binance, message);
      }
      if (message.content.startsWith('!Sell X50')) {
        await tradeSell(binance, message);
      }
      if (message.content.startsWith('!cancel')) {
        await cancelOrder(binance, 0, client, 'all', color.colorGreen)
      }
      if (message.content.startsWith('!ping')) {
        ping = Date.now() - message.createdTimestamp
        await message.channel.sendTyping();
        message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color.colorYellow)
              .setDescription(`>>> Pong! :: \`${client.ws.ping}\` ms
              Real Ping :: \`${ping}\` ms `)
          ]
        });
      }
      if (message.content.startsWith('!testsell')) {
        await setSell(true);
        await setSellTakeProfit(100000);
        await setSellStoploss(20);
      }
      if (message.content.startsWith('!testbuy')) {
        await setBuy(true);
        await setBuyTakeProfit(200);
        await setBuyStoploss(500000)
      }
      if (message.content.startsWith('!setbuy')) {
        await setBuy(true)
        await setBuyTakeProfit(1000000)
        await setBuyStoploss(20)
      }
      if (message.content.startsWith('!setsell')) {
        await setSell(true)
        await setSellTakeProfit(20)
        await setSellStoploss(1000000)
      }
      if (message.content.startsWith('!set0')) {
        await setBuy(false)
        await setBuyTakeProfit(null)
        await setBuyStoploss(null)
      
        await setSell(false)
        await setSellTakeProfit(null)
        await setSellStoploss(null)

        await setDefTime(0) ;

        message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(color.colorGreen)
              .setDescription(`All set default successful!`)
          ]
        });
      }
      if (message.content.startsWith('!settime')) {
        await setDefTime(0) ;
      }
      if (message.content.startsWith('to')){
        const a = await GetTickPriceBtc() ;
        console.log(a) ;
      }
      if (message.content.startsWith('!gethigher')){
        let SellStopLoss, SellakeProfit
        [SellStopLoss, SellakeProfit] = await getStopAndTake('sell') ;
        console.log("SellStoploss : " + SellStopLoss.toFixed(2) + ", SellTakeProfit : " + SellakeProfit.toFixed(2))
      }
      if (message.content.startsWith('!getlower')){
        let BuyStopLoss, BuyakeProfit
        [BuyStopLoss, BuyakeProfit] = await getStopAndTake('buy') ;
        console.log("BuyStoploss : " + BuyStopLoss.toFixed(2) + ", BuyTakeProfit : " + BuyakeProfit.toFixed(2))
      }
      
    } catch (error) {
      console.log("Message Create error : " + error)
    }
}) ;