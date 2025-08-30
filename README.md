# CoastCare

A comprehensive real-time coastal monitoring and threat detection system built with Next.js, Supabase, and OpenWeather APIs for Gujarat, India.

## Features

- **Real-time Weather Monitoring**: Live wind speed and temperature data from OpenWeather API for Gujarat coastal locations
- **Anomaly Detection**: Advanced algorithms for threat detection including threshold-based, statistical, and rate-of-change analysis
- **Alert System**: Multi-channel notifications with browser notifications, sound alerts, and visual indicators
- **Email Subscriptions**: Real-time email alerts for coastal conditions with customizable preferences
- **Data Ingestion**: Robust APIs for real-time weather data collection with quality validation
- **Interactive Dashboard**: Professional dashboard with charts, maps, and alert management
- **Scalable Architecture**: Built for high-availability deployment with Docker and Vercel support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Weather Data**: OpenWeather API (real-time)
- **Charts**: Recharts
- **Deployment**: Vercel, Docker
- **Monitoring**: Built-in health checks and logging

## 🚀 Quick Start

### GitHub Setup (One-time)

1. **Create a new repository on GitHub**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `coastcare` (or your preferred name)

2. **Run the setup script**
   ```bash
   # Windows
   scripts\github-setup.bat
   
   # Linux/Mac
   chmod +x scripts/github-setup.sh
   ./scripts/github-setup.sh
   ```

3. **Follow the prompts** to connect your local repository to GitHub

### Prerequisites

- Node.js 18+ and npm 8+
- Supabase account and project
- OpenWeather API key (free tier available)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/coastcare.git
   cd coastcare
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your credentials in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   
   # OpenWeather API Configuration
   OPENWEATHER_API_KEY=your_openweather_api_key
   
   # Email Configuration (Optional - for email alerts)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```
   
   **For Email Subscriptions (Optional):**
   ```bash
   # Run this in your Supabase SQL editor or via psql
   \i scripts/004_setup_email_subscriptions.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Vercel (Recommended)
1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Import your forked repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Docker
```bash
# Build the image
docker build -t coastcare .

# Run the container
docker run -p 3000:3000 coastcare
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - The open source Firebase alternative
- [OpenWeather API](https://openweathermap.org/api) - Weather data
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icons

## Real-Time Data Sources

### OpenWeather API Integration

CoastCare uses OpenWeather API to provide real-time weather data for Gujarat coastal locations:

- **Wind Speed**: Real-time wind speed data in mph
- **Temperature**: Current temperature in Celsius
- **Coverage**: 8 major coastal locations in Gujarat
- **Update Frequency**: Every 5 minutes automatically
- **API Rate Limit**: 1000 calls/day (free tier)

### Supported Locations

- Okha (22.4667, 69.0667)
- Dwarka (22.2400, 68.9670)
- Porbandar (21.6417, 69.6139)
- Veraval (20.9039, 70.3679)
- Mundra (22.8400, 69.7200)
- Kandla (23.0330, 70.2200)
- Bhavnagar (21.7645, 72.1519)
- Surat (21.1702, 72.8311)

## API Documentation

### Real-Time Data Ingestion

#### Trigger OpenWeather Data Update
```bash
POST /api/ingest/openweather
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "coordinates_processed": 8,
    "coordinates_successful": 8,
    "total_readings_inserted": 16,
    "total_alerts_generated": 0
  }
}
```

#### Get Real-Time Sensor Data
```bash
GET /api/websocket?sensor_id=sensor-uuid
```

### Data Retrieval

#### Get Sensors
```bash
GET /api/sensors
```

#### Get Sensor Readings
```bash
GET /api/sensors/{id}/readings?limit=100&hours=24
```

#### Get Alerts
```bash
GET /api/alerts?resolved=false&severity=critical&limit=50
```

#### Get Dashboard Stats
```bash
GET /api/dashboard/stats
```

### Health Check
```bash
GET /health
```

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENWEATHER_API_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

1. **Build the image**
   ```bash
   docker build -t coastcare .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key | Yes |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Development redirect URL | No |

### Anomaly Detection Thresholds

Thresholds can be configured in `lib/anomaly-detection/detector.ts`:

```typescript
const THRESHOLDS = {
  water_level: { high: 2.5, critical: 3.5, low: 0.2 },
  wave_height: { high: 4.0, critical: 6.0, extreme: 8.0 },
  wind_speed: { high: 25, critical: 40, extreme: 60 },
  temperature: { high: 30, low: 5, critical_high: 35, critical_low: 0 },
}
```

## Development

### Running Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Architecture

### Database Schema

- **coastal_sensors**: Sensor metadata and configuration for Gujarat locations
- **sensor_readings**: Time-series weather data from OpenWeather API
- **anomaly_alerts**: Generated alerts and notifications

### Key Components

- **Dashboard**: Real-time monitoring interface with live weather data
- **Data Ingestion**: OpenWeather API integration for real-time weather data
- **Anomaly Detection**: Threat detection algorithms for weather anomalies
- **Alert System**: Multi-channel notification system
- **Real-Time Status**: Live monitoring of data ingestion and API health

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Monitoring and Maintenance

### Health Checks
- Application health: `/health`
- Database connectivity: Included in health check
- API status: Monitored via health endpoint
- OpenWeather API status: Real-time monitoring in dashboard

### Logging
- Application logs: Console and Vercel logs
- Error tracking: Built-in error handling
- Performance monitoring: Vercel Analytics
- API monitoring: Real-time status tracking

### Backup and Recovery
- Database: Supabase automatic backups
- Application: Git version control
- Configuration: Environment variable management
