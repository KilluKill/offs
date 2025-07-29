# SecureVPN Web Application

A modern, responsive VPN web application built with Flask backend and vanilla JavaScript frontend. This application provides a clean interface for managing VPN connections with real-time status updates and connection statistics.

## Features

- 🔒 **Modern VPN Interface**: Clean, responsive design with glassmorphism effects
- 🌍 **Multiple Server Locations**: Choose from servers in US, Europe, Asia, and Canada
- 📊 **Real-time Statistics**: Monitor data usage, connection time, and server status
- 🚀 **Fast Connection**: Quick connect/disconnect with visual feedback
- 📱 **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Beautiful UI**: Modern design with smooth animations and transitions

## Screenshots

The application features:
- Header with logo and connection status indicator
- Main connection panel with IP display and server selection
- Real-time statistics panel when connected
- Features showcase panel highlighting VPN benefits

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Setup

1. **Clone or navigate to the webapp directory:**
   ```bash
   cd webapp
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python backend/app.py
   ```

5. **Access the application:**
   Open your web browser and navigate to: `http://localhost:5000`

## Project Structure

```
webapp/
├── backend/
│   └── app.py              # Flask backend application
├── static/
│   ├── app.js              # Frontend JavaScript
│   └── style.css           # CSS styles
├── templates/
│   └── index.html          # Main HTML template
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## API Endpoints

The Flask backend provides the following REST API endpoints:

- `GET /` - Serve the main application page
- `GET /api/status` - Get current VPN connection status
- `GET /api/servers` - Get list of available VPN servers
- `POST /api/connect` - Connect to a VPN server
- `POST /api/disconnect` - Disconnect from VPN
- `GET /api/stats` - Get connection statistics

## Usage

### Connecting to VPN

1. **Select a Server**: Choose from the available servers in the server list
2. **Click Connect**: Press the green "Connect" button
3. **Wait for Connection**: A loading overlay will appear during connection
4. **Monitor Status**: Once connected, view your new IP and connection stats

### Server Information

Each server displays:
- **Server Name**: Friendly name (e.g., "US East", "Europe")
- **Location**: Geographic location (e.g., "New York", "London")
- **Ping**: Response time in milliseconds
- **Load**: Server utilization percentage with color coding:
  - Green (0-50%): Low load
  - Orange (51-80%): Medium load
  - Red (81-100%): High load

### Connection Statistics

When connected, the app displays:
- **Data Sent/Received**: Real-time bandwidth usage
- **Connection Time**: Duration of current session
- **Connected Server**: Currently active server information

## Configuration

### Adding New Servers

To add new VPN servers, modify the `vpn_servers` list in `backend/app.py`:

```python
vpn_servers = [
    {'id': 6, 'name': 'Australia', 'location': 'Sydney', 'ping': 200, 'load': 25},
    # Add more servers here
]
```

### Customizing Appearance

- **Colors**: Modify CSS variables in `static/style.css`
- **Animations**: Adjust transition durations and effects
- **Layout**: Update grid layouts and responsive breakpoints

## Development

### Running in Development Mode

The Flask application runs in debug mode by default, enabling:
- Auto-reload on code changes
- Detailed error messages
- Debug toolbar (if installed)

### Production Deployment

For production deployment, consider:

1. **Using Gunicorn:**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
   ```

2. **Environment Variables:**
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   ```

3. **Reverse Proxy**: Use Nginx or Apache as a reverse proxy
4. **SSL Certificate**: Enable HTTPS for secure connections

## Security Considerations

⚠️ **Important**: This is a demonstration application and should not be used for actual VPN services without proper security implementations:

- Add authentication and authorization
- Implement proper VPN protocols (OpenVPN, WireGuard, etc.)
- Add encryption for API communications
- Implement rate limiting and DDoS protection
- Add logging and monitoring
- Secure server configurations

## Browser Compatibility

The application supports modern browsers with:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```bash
   # Kill process using port 5000
   sudo lsof -t -i tcp:5000 | xargs kill -9
   ```

2. **Module Not Found:**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Static Files Not Loading:**
   - Check file paths in templates
   - Verify static folder structure
   - Clear browser cache

### Development Tips

- Use browser developer tools to debug JavaScript
- Check Flask console for backend errors
- Monitor network tab for API call issues
- Test on different screen sizes for responsiveness

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Please ensure proper licensing for production use.

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser console for errors
- Verify all dependencies are installed
- Ensure Python version compatibility

---

**Note**: This is a demonstration VPN application. For production VPN services, implement proper security measures, authentication, and actual VPN protocols.