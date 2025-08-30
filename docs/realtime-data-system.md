# Real-Time Data System

## Overview

The CoastCare system now provides real-time data for all three sensor types:
- **Wind Speed** (from OpenWeather API)
- **Temperature** (from OpenWeather API) 
- **Wave Height** (from Marine API)

## Architecture

### Data Flow

1. **Data Ingestion** (`/api/ingest/batch`)
   - Fetches weather data from OpenWeather API for wind speed and temperature
   - Fetches marine data from Open-Meteo Marine API for wave height
   - Groups sensors by coordinates to minimize API calls
   - Inserts readings into database with anomaly detection

2. **Real-Time Service** (`lib/websocket/client.ts`)
   - Polls data every 15 seconds
   - Triggers batch ingestion before fetching latest data
   - Provides subscription-based updates to UI components

3. **WebSocket API** (`/api/websocket`)
   - Returns latest readings for all sensor types
   - Includes active alerts and sensor count
   - Supports filtering by sensor types

### Sensor Types

| Sensor Type | Data Source | Unit | Critical Threshold | Icon |
|-------------|-------------|------|-------------------|------|
| Wind Speed | OpenWeather API | mph | > 20 mph | 💨 |
| Temperature | OpenWeather API | °C | > 35°C | 🌡️ |
| Wave Height | Marine API | meters | > 4m | 🌊 |

## Components

### Real-Time Components

1. **SensorMap** (`components/dashboard/sensor-map.tsx`)
   - Displays all sensor readings in a list format
   - Shows real-time values with color coding
   - Includes timestamps and sensor status

2. **GeoMap** (`components/dashboard/geo-map.tsx`)
   - Interactive map showing sensor locations
   - Custom icons for each sensor type
   - Color-coded based on severity levels
   - Enhanced popups with detailed information

3. **DashboardStats** (`components/dashboard/dashboard-stats.tsx`)
   - Real-time statistics for all sensor types
   - Average, max, min values
   - Critical sensor count
   - Active alerts summary

4. **RealTimeStatus** (`components/dashboard/real-time-status.tsx`)
   - Live status of each sensor type
   - Active/inactive sensor counts
   - Critical condition indicators
   - Last update timestamps

### API Endpoints

1. **Batch Ingestion** (`POST /api/ingest/batch`)
   ```json
   {
     "success": true,
     "total_readings_inserted": 24,
     "total_alerts_generated": 2,
     "timestamp": "2024-01-01T12:00:00Z"
   }
   ```

2. **Real-Time Data** (`GET /api/websocket?types=wind_speed,temperature,wave_height`)
   ```json
   {
     "success": true,
     "timestamp": "2024-01-01T12:00:00Z",
     "readings": [...],
     "alerts": [...],
     "sensorCount": 24
   }
   ```

## Configuration

### Environment Variables

```bash
# Required for OpenWeather API (wind speed and temperature)
OPENWEATHER_API_KEY=your_api_key_here

# Marine API is free and doesn't require a key
```

### Update Intervals

- **Data Ingestion**: Every 15 seconds (configurable in `RealtimeDataService`)
- **Duplicate Prevention**: 5-minute window to prevent duplicate readings
- **API Rate Limiting**: 100ms delay between coordinate groups

## Database Schema

### Sensors Table
```sql
CREATE TABLE coastal_sensors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('wind_speed', 'temperature', 'wave_height')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Readings Table
```sql
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES coastal_sensors(id),
  value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quality_score DECIMAL(3, 2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

### Manual Testing

1. **Check Real-Time Updates**
   ```bash
   # Test the batch ingestion endpoint
   curl -X POST http://localhost:3000/api/ingest/batch
   
   # Test the real-time data endpoint
   curl http://localhost:3000/api/websocket?types=wind_speed,temperature,wave_height
   ```

2. **Database Verification**
   ```sql
   -- Run the test script
   \i scripts/test-realtime-data.sql
   ```

### Visual Testing

1. Open the dashboard at `http://localhost:3000`
2. Verify that all three sensor types are displayed on the map
3. Check that values update every 15 seconds
4. Confirm color coding based on severity levels
5. Test sensor type filtering in the map

## Troubleshooting

### Common Issues

1. **No Data Appearing**
   - Check OpenWeather API key is set
   - Verify sensors are active in database
   - Check browser console for errors

2. **Stale Data**
   - Verify batch ingestion is running
   - Check for API rate limiting
   - Review duplicate prevention logic

3. **Map Not Loading**
   - Ensure Leaflet CSS is loaded
   - Check for JavaScript errors
   - Verify sensor coordinates are valid

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed API calls and data processing in the console.

## Performance Considerations

1. **API Optimization**
   - Sensors grouped by coordinates to minimize API calls
   - 5-minute duplicate prevention window
   - Rate limiting between coordinate groups

2. **Database Optimization**
   - Indexes on sensor_id and timestamp
   - Efficient queries for latest readings
   - Batch inserts for better performance

3. **Frontend Optimization**
   - 15-second update interval (configurable)
   - Subscription-based updates
   - Efficient re-rendering with React

## Future Enhancements

1. **WebSocket Support**
   - Replace polling with true WebSocket connections
   - Server-sent events for real-time updates

2. **Additional Data Sources**
   - NOAA API for additional marine data
   - Local sensor networks
   - Satellite data integration

3. **Advanced Analytics**
   - Trend analysis and forecasting
   - Machine learning for anomaly detection
   - Historical data visualization
