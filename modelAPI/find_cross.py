import pandas as pd
import numpy as np

def find_crossovers(df, macd_col='MACD', signal_col='Signal', cross_col='cross'):
    df[cross_col] = 0  # Initialize the 'cross' column with zeros

    # Find crossover conditions
    crossover_condition = (df[macd_col] > df[signal_col]) & (df[macd_col].shift(1) <= df[signal_col].shift(1))
    crossunder_condition = (df[macd_col] < df[signal_col]) & (df[macd_col].shift(1) >= df[signal_col].shift(1))

    # Assign values to the 'cross' column based on conditions
    df.loc[crossover_condition, cross_col] = 1
    df.loc[crossunder_condition, cross_col] = 2

    return df