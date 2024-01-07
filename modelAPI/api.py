from flask import Flask, jsonify
from binance.client import Client
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from function_indicator import GetAll_indicator
from find_cross import find_crossovers
from functionForPredict import getPredictCrossdown, getPredictCrossup, getUpdatePrice
from joblib import load
import tensorflow as tf
import gc
import os
from dotenv import load_dotenv
import logging

load_dotenv()

api_key = os.environ.get("API_KEY")
api_secret = os.environ.get("API_SECRET")
client = Client(api_key, api_secret)

start_date = datetime.now() - timedelta(days=7)
start_date_str = start_date.strftime("%Y-%m-%d %H:%M:%S")

app = Flask(__name__)

@app.route('/get_btcusd15m')
def get_btcusd():
    symbol = 'BTCUSDT'
    interval = '15m'
    path_old = 'price/BTCUSDT_15m.csv'
    path_model_buy = 'model/buy_model15min.h5'
    path_model_sell = 'model/sell_model15min.h5'
    
    df = getUpdatePrice(client ,symbol, interval, start_date_str, path_old)
    df.to_csv(path_old, index= False)

    ohlc = df[['timestamp','open','high','low','close','volume']].tail(400).reset_index(drop=True)
    ohlc[['open','high','low','close','volume']] = ohlc[['open','high','low','close','volume']].astype(float)
    ohlc = GetAll_indicator(ohlc)
    ohlc.to_csv('indi/indi400_BTCUSDT_15min.csv', index= False)
    
    ohlc = find_crossovers(ohlc, macd_col='MACD', signal_col='Signal', cross_col='cross')
    
    if ohlc['cross'].iloc[-1] == 1 :
        json_data = getPredictCrossup(ohlc, path_model_buy)
        return jsonify({"buy_btc15min": json_data})
    
    elif ohlc['cross'].iloc[-1] == 2 :
        json_data = getPredictCrossdown(ohlc, path_model_sell)
        return jsonify({"sell_btc15min": json_data})
    
    else :
        data = [{'null' : None}]
        dataFrame = pd.DataFrame(data)
        json_data = dataFrame.to_json(orient='records')
        return jsonify({"non_btc15min" : json_data})
        
        
@app.errorhandler(Exception)
def handle_error(e):
    logging.exception("An error occurred: %s", str(e))
    return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
    gc.collect()