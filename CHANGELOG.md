# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Email subscription system with customizable preferences
- Welcome email templates for new subscribers
- Public subscription API for anonymous users
- Database status check endpoint
- Comprehensive GitHub setup with CI/CD

### Changed
- Improved sensor text display in dashboard
- Enhanced layout spacing and responsiveness
- Updated README with deployment instructions

### Fixed
- Select component errors with empty string values
- Email subscription processing errors
- Sensor value truncation issues

## [1.0.0] - 2024-01-XX

### Added
- Real-time coastal monitoring dashboard
- Wind speed, temperature, and wave height sensors
- Interactive map with sensor locations
- Anomaly detection system
- Alert notifications (browser, sound, visual)
- Data ingestion from OpenWeather API
- Marine data integration
- Responsive design with Tailwind CSS
- TypeScript support throughout
- Supabase integration for data storage
- Real-time data updates
- Sensor categories and filtering
- Dashboard statistics
- Alert management system
- Health check endpoints
- Docker support
- Vercel deployment configuration

### Features
- **8 Coastal Locations**: Okha, Dwarka, Porbandar, Veraval, Mundra, Kandla, Bhavnagar, Surat
- **3 Sensor Types**: Wind Speed, Temperature, Wave Height
- **Real-time Updates**: Every 5 minutes from OpenWeather API
- **Anomaly Detection**: Threshold-based and rate-of-change detection
- **Multi-channel Alerts**: Browser notifications, sound alerts, visual indicators
- **Interactive Dashboard**: Charts, maps, and real-time status
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Professional UI**: Modern design with Tailwind CSS

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel, Docker
- **APIs**: OpenWeather API, Marine API

## [0.1.0] - 2024-01-XX

### Added
- Initial project setup
- Basic Next.js configuration
- Supabase integration
- Basic sensor data structure
- Initial UI components

---

## Version History

- **1.0.0**: First stable release with full coastal monitoring features
- **0.1.0**: Initial development version

## Upcoming Features

### Planned for v1.1.0
- [ ] User authentication system
- [ ] Mobile app support
- [ ] Additional sensor types
- [ ] Data export functionality
- [ ] Advanced analytics

### Planned for v1.2.0
- [ ] Real-time WebSocket connections
- [ ] Push notifications
- [ ] Custom alert rules
- [ ] Historical data analysis
- [ ] API rate limiting

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
