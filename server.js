const express = require("express")
const { getBuy, getSell, getBuyTakeProfit,
  getBuyStoploss, getSellTakeProfit,
  getSellStoploss, getMyprice,
  getTimePrevious, } = require('./manageOder/Trade.js')
const { GetTickPriceBtc } = require('./manageOder/TickPriceBTC.js')
const { client } = require('./index.js');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000

let ping = 0;
function setPing(value) {
  ping = value;
}

function getPing() {
  ping = client.ws.ping
  return ping
}

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req, res) => {
  const text = "Buy = " + await getBuy() +
    "<br>BuyTakeProfit = " + await getBuyTakeProfit() +
    "<br>BuyStoploss = " + await getBuyStoploss() +
    "<br><br>Sell = " + await getSell() +
    "<br>SellTakeProfit = " + await getSellTakeProfit() +
    "<br>SellStoploss = " + await getSellStoploss() +
    "<br><br>Myprice = " + await getMyprice() +
    "<br><br>TimePrevious = " + await getTimePrevious() +
    "<br>BTC Price : " + await GetTickPriceBtc() +
    "<br><br>Ping Server = " + getPing()
  res.setHeader('Content-Type', 'text/html');
  res.send(`${text}`);
})

app.listen(port, () => {
  console.log(`Listing at http://localhost:${port}`);
});

module.exports = {
  setPing: setPing,
};