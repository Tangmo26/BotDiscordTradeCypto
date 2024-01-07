import pandas as pd
import numpy as np

###############################################################################
def GetAll_indicator(ohlc) :
    def pine_ema(src, length):
        alpha = 2 / (length + 1)
        sum_val = pd.Series(index=src.index)
        
        for i in range(len(src)):
            if i == 0:
                sum_val.iloc[i] = src.iloc[i]
            else:
                sum_val.iloc[i] = alpha * src.iloc[i] + (1 - alpha) * sum_val.iloc[i-1]
        return sum_val

    # Assuming 'close' is the column in your DataFrame
    ohlc['EMA50'] = np.round(pine_ema(ohlc['close'], 50), decimals= 5)
    ohlc['EMA200'] = np.round(pine_ema(ohlc['close'], 200), decimals= 5)

    def pine_rsi(x, y):
        u = pd.Series(data=[max(x[i] - x[i-1], 0) for i in range(1, len(x))], index=x.index[1:])
        d = pd.Series(data=[max(x[i-1] - x[i], 0) for i in range(1, len(x))], index=x.index[1:])
        
        rs = pine_rma(u, y) / pine_rma(d, y)
        res = 100 - 100 / (1 + rs)
        
        return np.round(res, decimals= 5)

    def pine_rma(src, length):
        alpha = 1 / length
        sum_val = pd.Series(index=src.index)
        
        for i in range(len(src)):
            if i == 0:
                sum_val.iloc[i] = src.iloc[i]
            else:
                sum_val.iloc[i] = alpha * src.iloc[i] + (1 - alpha) * sum_val.iloc[i-1]
        return sum_val

    # Assuming 'close' is the column containing closing prices in your DataFrame
    ohlc['RSI'] = pine_rsi(ohlc['close'], 14)

    def pine_sma(x, y):
        sum_val = pd.Series(index=x.index)
        
        for i in range(len(x)):
            sum_val.iloc[i] = sum(x.iloc[max(0, i-y+1):i+1]) / y
        
        return sum_val

    def pine_dev(source, length):
        mean = pine_sma(source, length)
        sum_val = pd.Series(index=source.index)
        
        for i in range(len(source)):
            val = source.iloc[max(0, i-length+1):i+1]
            sum_val.iloc[i] = sum(abs(val - mean.iloc[i])) / length
        
        return sum_val

    def calculate_cci(data, length=20):
        src = (data['high'] + data['low'] + data['close']) / 3
        ma = pine_sma(src, length)
        dev = pine_dev(src, length)
        
        cci = (src - ma) / (0.015 * dev)
        
        return np.round(cci, decimals= 5)

    # Assuming 'high', 'low', and 'close' are columns in your DataFrame
    ohlc['CCI'] = calculate_cci(ohlc)

    def calculate_macd(data, fast_length=12, slow_length=26, signal_length=9, source_column='close'):
        src = data[source_column]
        
        fast_ma = pine_ema(src, fast_length)
        slow_ma = pine_ema(src, slow_length)

        macd = fast_ma - slow_ma
        signal = pine_ema(macd, signal_length)
        
        return np.round(macd, decimals = 7), np.round(signal, decimals= 7)

    # Assuming 'close' is the column in your DataFrame
    ohlc['MACD'], ohlc['Signal'] = calculate_macd(ohlc, 12, 26, 9, 'close')


    def calculate_adx(data, period=14):
        ext_adx_buffer = [0.0] * len(data)
        ext_pdi_buffer = [0.0] * len(data)
        ext_ndi_buffer = [0.0] * len(data)
        ext_pd_buffer = [0.0] * len(data)
        ext_nd_buffer = [0.0] * len(data)
        ext_tmp_buffer = [0.0] * len(data)

        # Checking for bars count
        if len(data) < period:
            return None

        # Detect start position
        for i in range(1, len(data)):
            # Get some data
            high_price = data['high'][i]
            prev_high = data['high'][i - 1]
            low_price = data['low'][i]
            prev_low = data['low'][i - 1]
            prev_close = data['close'][i - 1]

            # Fill main positive and main negative buffers
            tmp_pos = high_price - prev_high
            tmp_neg = prev_low - low_price

            tmp_pos = max(0.0, tmp_pos)
            tmp_neg = max(0.0, tmp_neg)

            if tmp_pos > tmp_neg:
                tmp_neg = 0.0
            elif tmp_pos < tmp_neg:
                tmp_pos = 0.0
            else:
                tmp_pos = 0.0
                tmp_neg = 0.0

            # Define TR
            tr = max(max(abs(high_price - low_price), abs(high_price - prev_close)), abs(low_price - prev_close))

            if tr != 0.0:
                ext_pd_buffer[i] = 100.0 * tmp_pos / tr
                ext_nd_buffer[i] = 100.0 * tmp_neg / tr
            else:
                ext_pd_buffer[i] = 0.0
                ext_nd_buffer[i] = 0.0

            # Fill smoothed positive and negative buffers
            ext_pdi_buffer[i] = exponential_ma(i, period, ext_pdi_buffer[i - 1], ext_pd_buffer)
            ext_ndi_buffer[i] = exponential_ma(i, period, ext_ndi_buffer[i - 1], ext_nd_buffer)

            # Fill ADXTmp buffer
            tmp = ext_pdi_buffer[i] + ext_ndi_buffer[i]

            if tmp != 0.0:
                tmp = 100.0 * abs((ext_pdi_buffer[i] - ext_ndi_buffer[i]) / tmp)
            else:
                tmp = 0.0

            ext_tmp_buffer[i] = tmp

            # Fill smoothed ADX buffer
            ext_adx_buffer[i] = exponential_ma(i, period, ext_adx_buffer[i - 1], ext_tmp_buffer)

        # Add calculated values to the DataFrame
        return np.round(ext_pdi_buffer, decimals=5), np.round(ext_ndi_buffer, decimals= 5), np.round(ext_adx_buffer, decimals=5)

    def exponential_ma(index, length, prev_value, buffer):
        alpha = 2 / (length + 1)
        sum_val = prev_value * (1 - alpha) + buffer[index] * alpha
        return sum_val

    # Assuming 'high', 'low', and 'close' are columns in your DataFrame
    ohlc['DIplus'],ohlc['DIminus'], ohlc['ADX'] = calculate_adx(ohlc, 14)


    def calculate_mfi(data, period=14):
        ext_mfi_buffer = [0.0] * len(data)

        for i in range(period, len(data)):
            positive = 0.0
            negative = 0.0
            current_tp = typical_price(data['high'][i], data['low'][i], data['close'][i])

            for j in range(1, period + 1):
                index = i - j
                previous_tp = typical_price(data['high'][index], data['low'][index], data['close'][index])

                if current_tp > previous_tp:
                    positive += data['volume'][index + 1] * current_tp

                if current_tp < previous_tp:
                    negative += data['volume'][index + 1] * current_tp

                current_tp = previous_tp

            if negative != 0.0:
                ext_mfi_buffer[i] = 100.0 - (100.0 / (1 + positive / negative))
            else:
                ext_mfi_buffer[i] = 100.0

        return np.round(ext_mfi_buffer, decimals= 5)

    def typical_price(high, low, close):
        return (high + low + close) / 3.0

    # Assuming 'high', 'low', 'close', and 'volume' are columns in your DataFrame
    ohlc['MFI'] = calculate_mfi(ohlc, 14)



    def calculate_bollinger_bands(ohlc, period=20, mult=2.0):
        basic = pine_sma(ohlc['close'], period)
        std_dev = mult * calculate_std_dev(basic,ohlc, period)
        
        upper = basic + std_dev
        lower = basic - std_dev
        
        bbr = (ohlc['close'] - lower) / (upper - lower)
        
        return np.round(bbr, decimals= 5)

    def calculate_std_dev(basic , ohlc, period):
        std_dev = pd.Series(index=ohlc.index)
        
        for i in range(len(ohlc)):
            if i >= period:
                price_slice = ohlc['close'].iloc[max(0, i - period + 1):i + 1]
                ma_price_slice = basic.iloc[max(0, i - period + 1):i + 1]
                
                std_dev.iloc[i] = np.sqrt(np.sum((price_slice - ma_price_slice)**2) / period)
        
        return std_dev


    ohlc['BBr'] = calculate_bollinger_bands(ohlc, 20, 2)

    def calculate_cumdelta(ohlc, lenght = 14):
        tw = ohlc['high'] - np.maximum(ohlc['open'], ohlc['close'])
        bw = np.minimum(ohlc['open'], ohlc['close']) - ohlc['low']
        body = np.abs(ohlc['close'] - ohlc['open'])

        deltaup = ohlc['volume'] * _rate(ohlc['open'] <= ohlc['close'], tw, bw, body)
        deltadown = ohlc['volume'] * _rate(ohlc['open'] > ohlc['close'], tw, bw, body)
        delta = np.where(ohlc['close'] >= ohlc['open'], deltaup, -deltadown)
        
        cumdelta = np.cumsum(delta)
        cumdelta = pd.DataFrame(cumdelta)
        cumdelta = pine_rsi(cumdelta[0], lenght)

        return np.round(cumdelta, decimals= 5)

    def _rate(cond, tw, bw, body):
        ret = 0.5 * (tw + bw + np.where(cond, 2 * body, 0)) / (tw + bw + body)
        ret = np.where(pd.isnull(ret), 0.5, ret)
        return ret

    ohlc['cumdelta_rsi'] = calculate_cumdelta(ohlc, 14)

    def calculate_roc(ohlc, length=12):
        source = ohlc['close']
        roc = 100 * (source - source.shift(length)) / source.shift(length)
        roc = roc.fillna(0)  # Replace NaN values with 0

        return np.round(roc, decimals = 5)

    # Assuming 'ohlc' DataFrame has columns: ['open', 'high', 'low', 'close']
    ohlc['ROC'] = calculate_roc(ohlc, 12)


    def calculate_stochastic_rsi(ohlc, length_rsi=14, length_stoch=14, smooth_k=3, smooth_d=3):
        src = ohlc['close']
        
        rsi1 = pine_rsi(src, length_rsi)
        
        stoch_rsi_k = pine_sma(pine_stoch(rsi1, rsi1, rsi1, length_stoch), smooth_k)
        stoch_rsi_d = pine_sma(stoch_rsi_k, smooth_d)
        
        return np.round(stoch_rsi_k, decimals= 5), np.round(stoch_rsi_d, decimals=5)


    def pine_stoch(close, low, high, length):
        lowest_low = pd.Series(index=close.index)
        highest_high = pd.Series(index=close.index)

        for i in range(len(close)):
            lowest_low.iloc[i] = np.min(low.iloc[max(0, i - length + 1):i + 1])
            highest_high.iloc[i] = np.max(high.iloc[max(0, i - length + 1):i + 1])

        denominator = highest_high - lowest_low
        # Add a check to avoid division by zero
        stoch = 100 * (close - lowest_low) / np.where(denominator == 0, 1, denominator)
        
        return stoch

    ohlc['stoch_rsi_k'], ohlc['stoch_rsi_d'] = calculate_stochastic_rsi(ohlc, 14, 14, 3, 3)



    def calculate_parabolic_sar(df, sar_step=0.02, sar_maximum=0.2):
        sar_buffer = []
        ep_buffer = []
        af_buffer = []

        last_rev_pos = 0
        direction_long = False
        sar_step_value = sar_step
        sar_maximum_value = sar_maximum

        parabolic_sar_values = []  # Separate list for ParabolicSAR column
        signal_values = []  # Separate list for Signal column

        for i in range(len(df)):
            if i < 1:
                # First pass, set as SHORT
                af_buffer.append(sar_step_value)
                sar_buffer.append(df['high'][i])
                last_rev_pos = 0
                direction_long = False
                ep_buffer.append(df['low'][i])
            else:
                if direction_long:
                    if sar_buffer[-1] > df['low'][i]:
                        # Switch to SHORT
                        direction_long = False
                        sar_buffer.append(get_high(i, last_rev_pos, df['high']))
                        ep_buffer.append(df['low'][i])
                        last_rev_pos = i
                        af_buffer.append(sar_step_value)
                    else:
                        if i != last_rev_pos:
                            af_buffer.append(af_buffer[-1])
                            ep_buffer.append(ep_buffer[-1])
                else:
                    if sar_buffer[-1] < df['high'][i]:
                        # Switch to LONG
                        direction_long = True
                        sar_buffer.append(get_low(i, last_rev_pos, df['low']))
                        ep_buffer.append(df['high'][i])
                        last_rev_pos = i
                        af_buffer.append(sar_step_value)
                    else:
                        if i != last_rev_pos:
                            af_buffer.append(af_buffer[-1])
                            ep_buffer.append(ep_buffer[-1])

                if direction_long:
                    if df['high'][i] > ep_buffer[-1] and i != last_rev_pos:
                        ep_buffer[-1] = df['high'][i]
                        af_buffer[-1] = af_buffer[-1] + sar_step_value
                        if af_buffer[-1] > sar_maximum_value:
                            af_buffer[-1] = sar_maximum_value
                    else:
                        if i != last_rev_pos:
                            af_buffer[-1] = af_buffer[-1]
                            ep_buffer[-1] = ep_buffer[-1]
                    sar_buffer.append(sar_buffer[-1] + af_buffer[-1] * (ep_buffer[-1] - sar_buffer[-1]))

                    if sar_buffer[-1] > df['low'][i] or sar_buffer[-1] > df['low'][i-1]:
                        sar_buffer[-1] = min(df['low'][i], df['low'][i-1])
                else:
                    if df['low'][i] < ep_buffer[-1] and i != last_rev_pos:
                        ep_buffer[-1] = df['low'][i]
                        af_buffer[-1] = af_buffer[-1] + sar_step_value
                        if af_buffer[-1] > sar_maximum_value:
                            af_buffer[-1] = sar_maximum_value
                    else:
                        if i != last_rev_pos:
                            af_buffer[-1] = af_buffer[-1]
                            ep_buffer[-1] = ep_buffer[-1]
                    sar_buffer.append(sar_buffer[-1] + af_buffer[-1] * (ep_buffer[-1] - sar_buffer[-1]))

                    if sar_buffer[-1] < df['high'][i] or sar_buffer[-1] < df['high'][i-1]:
                        sar_buffer[-1] = max(df['high'][i], df['high'][i-1])

            # Append ParabolicSAR and Signal values to the separate lists
            parabolic_sar_values.append(sar_buffer[-1])
            signal_values.append(1 if sar_buffer[-1] > df['close'][i] else 0)

        return signal_values

    def get_high(curr_pos, start, high):
        result = high[start]
        for i in range(start + 1, curr_pos + 1):
            if result < high[i]:
                result = high[i]
        return result

    def get_low(curr_pos, start, low):
        result = low[start]
        for i in range(start + 1, curr_pos + 1):
            if result > low[i]:
                result = low[i]
        return result

    ohlc['ParabolicSAR_Signal'] = calculate_parabolic_sar(ohlc)


    def calculate_atr(data, length=14):
        true_range = pd.Series(index=data.index)

        for i in range(len(data)):
            if i == 0:
                true_range.iloc[i] = data['high'].iloc[i] - data['low'].iloc[i]
            else:
                high_low = data['high'].iloc[i] - data['low'].iloc[i]
                high_close = abs(data['high'].iloc[i] - data['close'].iloc[i - 1])
                low_close = abs(data['low'].iloc[i] - data['close'].iloc[i - 1])
                true_range.iloc[i] = max(high_low, high_close, low_close)

        atr_values = pine_rma(true_range, length)
        return np.round(atr_values, decimals= 5)

    ohlc['ATR'] = calculate_atr(ohlc, 14)
    ohlc = ohlc.iloc[200:]
    ohlc = ohlc.reset_index(drop=True)
    return ohlc
