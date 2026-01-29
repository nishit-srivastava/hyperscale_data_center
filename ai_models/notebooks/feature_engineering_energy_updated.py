#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt


# In[2]:


files = {
    "RackA": "../data/rack_a_telemetry.csv",
    "RackB": "../data/rack_b_telemetry.csv",
    "RackC": "../data/rack_c_telemetry.csv",
    "RackD": "../data/rack_d_telemetry.csv"
}




# In[3]:


dfs = []

for rack, path in files.items():
    df = pd.read_csv(path)
    
    # Force correct datetime parsing (handles +00:00)
    df["time_utc"] = pd.to_datetime(df["time_utc"], utc=True, errors="coerce")
    
    df["rack_id"] = rack
    dfs.append(df)


# In[4]:


data = (
    pd.concat(dfs, ignore_index=True)
      .dropna(subset=["time_utc"])
      .sort_values(by="time_utc")
      .reset_index(drop=True)
)

data.head()


# In[5]:


## Sanity Check
print(data.isna().sum())
data.describe()


# In[6]:


## Features
FEATURES = [
    "cpu_util",
    "power_kw",
    "ambient_temp_c",
    "inlet_temp_c",
    "exhaust_temp_c",
    "fan_speed_rpm",
    "humidity"
]


# In[7]:


## Scaling
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()

data_scaled = data.copy()

for rack in data_scaled["rack_id"].unique():
    idx = data_scaled["rack_id"] == rack
    data_scaled.loc[idx, FEATURES] = scaler.fit_transform(
        data_scaled.loc[idx, FEATURES]
    )


# In[8]:


data_scaled[FEATURES].describe()


# In[9]:


##Sequence Builder (Sliding Window 5 minutes)

def create_sequences(df, features, window=30):
    X, y = [], []
    for i in range(len(df) - window):
        X.append(df[features].iloc[i:i+window].values)
        y.append(df[features].iloc[i+window].values)
    return np.array(X), np.array(y)


# In[10]:


X_all, y_all = [], []

WINDOW = 30

for rack in data_scaled["rack_id"].unique():
    rack_df = data_scaled[data_scaled["rack_id"] == rack]
    
    X, y = create_sequences(rack_df, FEATURES, WINDOW)
    
    X_all.append(X)
    y_all.append(y)

X = np.vstack(X_all)
y = np.vstack(y_all)

print("X shape:", X.shape)
print("y shape:", y.shape)


# In[11]:


## sanity check
# Check one sample
print(X[0].shape)
print(y[0])

# Ensure no NaNs
print(np.isnan(X).sum(), np.isnan(y).sum())


# In[12]:


##“Feature normalization and sequence construction were performed independently for each rack to preserve localized operational dynamics and prevent cross-rack data leakage.”


# In[13]:


np.save("X.npy", X)
np.save("y.npy", y)


# In[ ]:





# ## Energy Forecast Sequences (for Transformer / PatchTST)
# Adds energy-only forecasting tensors without modifying existing outputs.
# 
# - X_Energy → (samples, time_steps, features)
# - Y_Energy → (samples, horizon)
# 

# In[14]:


TARGET = 'power_kw'
WINDOW = 30
HORIZON = 12

def create_energy_sequences(df, features, target, window, horizon):
    X, y = [], []
    for i in range(len(df) - window - horizon):
        X.append(df[features].iloc[i:i+window].values)
        y.append(df[target].iloc[i+window:i+window+horizon].values)
    return np.array(X), np.array(y)

X_energy_all, y_energy_all = [], []

for rack in data_scaled['rack_id'].unique():
    rack_df = data_scaled[data_scaled['rack_id'] == rack]

    X_e, y_e = create_energy_sequences(
        rack_df,
        FEATURES,
        TARGET,
        WINDOW,
        HORIZON
    )

    X_energy_all.append(X_e)
    y_energy_all.append(y_e)

X_Energy = np.vstack(X_energy_all)
Y_Energy = np.vstack(y_energy_all)

print('X_Energy shape:', X_Energy.shape)
print('Y_Energy shape:', Y_Energy.shape)


# In[15]:


np.save('X_Energy.npy', X_Energy)
np.save('Y_Energy.npy', Y_Energy)

print('Saved X_Energy.npy and Y_Energy.npy')


# In[ ]:




