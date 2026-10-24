-- Create the wind_data table
CREATE TABLE IF NOT EXISTS wind_data (
    start_time   TEXT PRIMARY KEY,
    generation_actual REAL,
    generation_forecast REAL,
    publish_time TEXT
);
