require('dotenv/config') ;
const { getBinance } = require('./handlers/binancemain.js')
const BOTTRADE = require('./handlers/client.js') ;
const client = new BOTTRADE() ;
const binance = getBinance() ;

module.exports = { binance, client };

try{
    client.start(process.env.TOKEN);
}catch (error) {
    console.log(`ERR: ${error}`) ;
}

process.on("unhandledRejection", (reason, p) => {
    console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
    console.log(reason, p);
});
  
process.on("uncaughtException", (err, origin) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
  
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});