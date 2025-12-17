import psycopg2
import pandas as pd
import numpy as np

# # 1. Configuration
# DB_CONFIG = {
#     'dbname': 'thingsboard',
#     'user': 'postgres',
#     'password': 'your_password',  # UPDATE THIS
#     'host': 'localhost',
#     'port': '5432'
# }


DB_CONFIG = {
    "host": "172.23.106.87",
    "port": 5434,
    "database": "thingsboard",
    "user": "tbuser",
    "password": "tbpassword"
}


DEVICE_NAME = 'RackA_Device' # Ensure this matches your specific device name in ThingsBoard
OUTPUT_FILE = 'rack_a_telemetry.csv'

# 2. SQL Query
# We fetch specific keys derived from your Node-RED snippet.
# We use COALESCE to grab the value from whichever column (double or long) it sits in.
query = """
SELECT
    to_timestamp(t.ts / 1000.0) AS time_utc,
    k.key AS metric_name,
    COALESCE(t.dbl_v, t.long_v) AS metric_value
FROM ts_kv t
JOIN device d ON d.id = t.entity_id
JOIN key_dictionary k ON k.key_id = t.key
WHERE d.name = %s
  AND k.key IN (
      'cpu_util', 
      'power_kw', 
      'ambient_temp_c', 
      'inlet_temp_c', 
      'exhaust_temp_c', 
      'fan_speed_rpm', 
      'humidity'
  )
ORDER BY t.ts ASC;
"""

try:
    print(f"Connecting to database to fetch data for {DEVICE_NAME}...")
    
    with psycopg2.connect(**DB_CONFIG) as conn:
        # Read raw EAV data
        df_raw = pd.read_sql(query, conn, params=(DEVICE_NAME,))

    if df_raw.empty:
        print("No data found! Check if the Device Name is correct or if telemetry exists.")
    else:
        print(f"Raw data fetched: {len(df_raw)} rows.")

        # 3. PIVOT: Turn Keys into Columns
        # Index = Time, Columns = Metric Name, Values = Metric Value
        df_flat = df_raw.pivot_table(
            index='time_utc', 
            columns='metric_name', 
            values='metric_value'
        )

        # 4. Clean up
        # If timestamps aren't perfectly aligned (ms differences), 
        # you might get NaNs. Forward fill (ffill) fills gaps with the last known value.
        df_flat = df_flat.ffill().dropna(how='all')
        
        # Reset index so 'time_utc' becomes a regular column in the CSV
        df_flat.reset_index(inplace=True)

        # 5. Save to CSV
        df_flat.to_csv(OUTPUT_FILE, index=False)
        
        print("-" * 30)
        print(f"SUCCESS: Data saved to {OUTPUT_FILE}")
        print("-" * 30)
        print(df_flat.head())

except Exception as e:
    print(f"Error: {e}")