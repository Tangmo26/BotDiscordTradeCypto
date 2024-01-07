import pandas as pd
import numpy as np
from find_win_loss_new import findBuySell
from keras.models import load_model

columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 'close_time', 'quote_asset_volume',
            'number_of_trades', 'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore']

def getUpdatePrice(client, symbol, interval, start_date_str, path_old) :
    klines = client.get_historical_klines(symbol, interval, start_date_str)
    df_new = pd.DataFrame(klines, columns=columns)
    df_new = df_new.drop(df_new.index[-1])
    df_existing = pd.read_csv(path_old) ;
    
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    df_combined = df_combined.drop_duplicates(subset='timestamp')
    
    df_combined = df_combined[['timestamp', 'open', 'high', 'low', 'close', 'volume']]
    
    return df_combined

def getPredictCrossup(ohlc, path_model) :
    df_buy, df_sell = findBuySell(ohlc, 25, 1.010, 1.025)
    df_buy = df_buy.reset_index(drop=True)
        
    # df_buy.to_csv('buy_winloss_15min.csv', index= False)
    df_buy = df_buy.tail(1)

    df_b = df_buy.drop(columns=['timestamp','open','high','low','close','volume', 'EMA50', 'EMA200', 'cross'])
    df_b = df_b.astype('float32')

    model = load_model(path_model)
    x = np.reshape(df_b, (df_b.shape[0], 1, df_b.shape[1]))
    pred = model.predict(x)
    y_pred = np.squeeze(pred)
    
    best_threshold = 0.2649827
    y_pred = (y_pred >= best_threshold).astype(int)
        
    predict = pd.DataFrame()
    predict['time'] = df_buy['timestamp']
    predict['result'] = y_pred
 
    json_data = predict.to_json(orient='records')
    
    return json_data

def getPredictCrossdown(ohlc, path_model) :
    df_buy, df_sell = findBuySell(ohlc, 25, 1.010, 1.025)
    df_sell = df_sell.reset_index(drop=True)
        
    # df_sell.to_csv('sell_winloss_15min.csv', index= False)
    df_sell = df_sell.tail(1)

    df_b = df_sell.drop(columns=['timestamp','open','high','low','close','volume', 'EMA50', 'EMA200', 'cross'])
    df_b = df_b.astype('float32')

    model = load_model(path_model)
    x = np.reshape(df_b, (df_b.shape[0], 1, df_b.shape[1]))
    pred = model.predict(x)
    y_pred = np.squeeze(pred)
    
    best_threshold = 0.13111377
    y_pred = (y_pred >= best_threshold).astype(int)
    
    predict = pd.DataFrame()
    predict['time'] = df_sell['timestamp']
    predict['result'] = y_pred
        
    json_data = predict.to_json(orient='records')
    
    return json_data