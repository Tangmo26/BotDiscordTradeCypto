import numpy as np
import pandas as pd

indicators = ['RSI', 'CCI', 'MACD', 'Signal', 'DIplus', 'DIminus', 'ADX', 'MFI', 'BBr', 'cumdelta_rsi', 'ROC', 'stoch_rsi_k', 'stoch_rsi_d', 'ATR']
columnPrices =['high', 'low', 'close', 'open']
columnDifEma = ['DifEma50', 'DifEma200']


def findBuySell(df, num = 25, stoploss = None, takeprofit = None) :
    num_previous_columns = num
    
    # Create previous columns for each indicator
    for indicator in indicators:
        for i in range(1, num_previous_columns + 1):
            prev_col_name = f'dif_{indicator}_pre{i}'
            df[prev_col_name] = np.round(df[indicator] - df[indicator].shift(i), decimals = 5)
            
    for columnPrice in columnPrices:
        for i in range(0, num_previous_columns + 1):
            prev_col_name = f'dif_{columnPrice}_pre{i}'
            df[prev_col_name] = np.round(df[columnPrice].shift(i)/df['close'], decimals = 5)
            
    for i in range(0, num_previous_columns + 1):
        prev_col_50 = f'dif_EMA50_pre{i}'
        prev_col_200 = f'dif_EMA200_pre{i}'
        df[prev_col_50] = np.round(df['EMA50'].shift(i)/df['close'], decimals= 5)
        df[prev_col_200] = np.round(df['EMA200'].shift(i)/df['close'], decimals= 5)
    
    df = df.iloc[num_previous_columns:].reset_index(drop=True)

    df_buy = df[(df['cross'] == 1)]
    df_sell = df[(df['cross'] == 2)]
	
    return df_buy, df_sell
    