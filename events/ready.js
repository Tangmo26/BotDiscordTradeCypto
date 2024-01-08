require('../server.js') ;
const { ActivityType } = require("discord.js");
const moment = require('moment-timezone');
const { getSell, getBuy, 
        getTimePrevious, 
        variableCheck, checkFalseBuySell,
        setDefTime, tradeBuy, tradeSell} = require('../manageOder/Trade.js') ;
const { checkBuy, checkSell } = require('../manageOder/profitSets.js');
const { secondRound } = require('../setting/config.js')
const currentDate = moment().tz('Asia/Bangkok') ;
const { binance, client } = require('../index.js');
const {fetchData, isAllowedTime } = require('../manageOder/fetchApi.js') ;

const channelID = process.env.CHANNEL_ID

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let isWait = false

client.on('ready', async () => {
    const channel = client.channels.cache.get(channelID)
    console.log(`Logged in as ${client.user.tag}!`) ;
    await variableCheck();

    // setInterval(async () => {
    //     if (await getBuy() === true) {
    //         await checkBuy() ;
    //     }else if (await getSell() === true){
    //         await checkSell() ;
    //     }
    // }, 1000 * secondRound * 1) ;
    

    const fetchDataInterval = setInterval(async () => {
        if (!isWait && isAllowedTime()) {
            isWait = true
            const [timeStamp, result, state] = await fetchData();
            console.log(timeStamp + " " + result + " " + state)
            const currentDate = moment().tz('Asia/Bangkok') ;
            const currentDateTime = currentDate.format('DD/MM/YYYY, HH:mm:ss');
            if (state === "buy") {
                if (result === 1) {
                    await tradeBuy(binance, client)
                }
                else {
                    channel.send(`buy crossover time :${currentDateTime} but not trade : ${result}`)
                }
            }
            else if (state === "sell") {
                if (result === 1) {
                    await tradeSell(binance, client)
                }
                else {
                    channel.send(`sell crossunder time :${currentDateTime} but not trade : ${result}`)
                }
            }
            else if (state === "non") {
                channel.send(`non cross time :${currentDateTime} : ${result}`)
            }
            isWait = false
        }
    }, 1000 * secondRound * 1); // Check every minute
    // set activitiy
    const currentDateTime = currentDate.format('DD/MM/YYYY, HH:mm:ss');
    const status = {
        name: `${currentDateTime}`,
        type: ActivityType.Playing,
    }
    client.user.setActivity(status);
    console.log(`${currentDateTime}`);

    await wait(3000) ;
    await checkFalseBuySell(client, binance)
}) ;