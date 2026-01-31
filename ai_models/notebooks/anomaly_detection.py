#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import matplotlib.pyplot as plt

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, RepeatVector, TimeDistributed
from tensorflow.keras.callbacks import EarlyStopping


# In[3]:


##Load Feature-Engineered Data
X = np.load("X.npy")

print("X shape:", X.shape)


# In[4]:


##Train / Validation Split (Temporal)

split = int(0.8 * len(X))

X_train, X_val = X[:split], X[split:]

print("Train samples:", X_train.shape[0])
print("Validation samples:", X_val.shape[0])


# In[5]:


## Dimension
TIMESTEPS = X.shape[1]
FEATURES = X.shape[2]


# In[6]:


##LSTM AutoEncoder Model
autoencoder = Sequential([
    LSTM(64, input_shape=(TIMESTEPS, FEATURES), return_sequences=False),
    RepeatVector(TIMESTEPS),
    LSTM(64, return_sequences=True),
    TimeDistributed(Dense(FEATURES))
])

autoencoder.compile(
    optimizer="adam",
    loss="mse"
)

autoencoder.summary()


# In[7]:


##Train Encoder
early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

history_ae = autoencoder.fit(
    X_train, X_train,
    epochs=40,
    batch_size=64,
    validation_data=(X_val, X_val),
    callbacks=[early_stop],
    verbose=1
)


# In[8]:


## Plot Training Loss
plt.plot(history_ae.history["loss"], label="Train Loss")
plt.plot(history_ae.history["val_loss"], label="Val Loss")
plt.xlabel("Epoch")
plt.ylabel("MSE")
plt.title("LSTM Autoencoder Training Loss")
plt.legend()
plt.show()


# In[9]:


##Reconstruction Error Calculation
X_val_pred = autoencoder.predict(X_val)

reconstruction_error = np.mean(
    np.square(X_val - X_val_pred),
    axis=(1, 2)
)


# In[10]:


## Anomaly Threshold

threshold = np.percentile(reconstruction_error, 95)

print("Anomaly threshold:", threshold)


# In[12]:


##Error Distribution
plt.hist(reconstruction_error, bins=50)
plt.axvline(threshold, color="red", linestyle="--")
plt.title("Reconstruction Error Distribution")
plt.xlabel("Reconstruction Error")
plt.ylabel("Count")
plt.show()


# In[13]:


## Detect Anomaly
anomalies = reconstruction_error > threshold

print("Total validation samples:", len(reconstruction_error))
print("Detected anomalies:", anomalies.sum())


# In[14]:


##Inspect Anomalous Sequences
anomaly_indices = np.where(anomalies)[0][:5]

for idx in anomaly_indices:
    print(f"Anomaly at index {idx} → error = {reconstruction_error[idx]:.5f}")


# In[15]:


##Save Autoencoder Model
autoencoder.save("lstm_autoencoder_model.h5")


# In[16]:


##Save Threshold for Inference
np.save("anomaly_threshold.npy", threshold)


# In[17]:


##“An LSTM-based autoencoder was trained on normal operating telemetry to detect anomalies using reconstruction error thresholds without requiring labeled fault data.”


# In[ ]:




