// VPN Web App JavaScript
class VPNApp {
    constructor() {
        this.isConnected = false;
        this.selectedServer = null;
        this.connectionTimer = null;
        this.statsTimer = null;
        this.connectStartTime = null;
        
        this.init();
    }

    init() {
        this.loadServers();
        this.updateStatus();
        this.startStatusPolling();
    }

    async loadServers() {
        try {
            const response = await fetch('/api/servers');
            const servers = await response.json();
            this.renderServers(servers);
        } catch (error) {
            console.error('Failed to load servers:', error);
        }
    }

    renderServers(servers) {
        const serverList = document.getElementById('serverList');
        serverList.innerHTML = '';

        servers.forEach(server => {
            const serverItem = document.createElement('div');
            serverItem.className = 'server-item';
            serverItem.onclick = () => this.selectServer(server);
            
            const loadPercentage = Math.min(server.load, 100);
            const loadColor = loadPercentage < 50 ? '#4CAF50' : 
                             loadPercentage < 80 ? '#ff9800' : '#f44336';

            serverItem.innerHTML = `
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-location">${server.location}</div>
                </div>
                <div class="server-stats">
                    <div class="ping">
                        <i class="fas fa-wifi"></i>
                        ${server.ping}ms
                    </div>
                    <div class="load">
                        <div class="load-bar">
                            <div class="load-fill" style="width: ${loadPercentage}%; background: ${loadColor};"></div>
                        </div>
                        ${server.load}%
                    </div>
                </div>
            `;

            serverList.appendChild(serverItem);
        });
    }

    selectServer(server) {
        // Remove previous selection
        document.querySelectorAll('.server-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked server
        event.target.closest('.server-item').classList.add('selected');
        this.selectedServer = server;
    }

    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            
            this.isConnected = status.connected;
            this.updateUI(status);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }

    updateUI(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        const currentIP = document.getElementById('currentIP');
        const currentLocation = document.getElementById('currentLocation');
        const connectBtn = document.getElementById('connectBtn');
        const connectBtnText = connectBtn.querySelector('span');
        const statsPanel = document.getElementById('statsPanel');

        // Update status indicator
        statusDot.className = 'status-dot ' + (status.connected ? 'connected' : 'disconnected');
        statusText.textContent = status.connected ? 'Connected' : 'Disconnected';

        // Update IP and location
        currentIP.textContent = status.ip || 'Unknown';
        if (status.connected && status.server) {
            currentLocation.textContent = `Connected via ${status.server.name} (${status.server.location})`;
        } else {
            currentLocation.textContent = 'Your real location';
        }

        // Update connect button
        if (status.connected) {
            connectBtn.className = 'connect-btn disconnect';
            connectBtnText.textContent = 'Disconnect';
            connectBtn.querySelector('i').className = 'fas fa-power-off';
            
            // Show stats panel
            statsPanel.style.display = 'block';
            this.startStatsUpdates();
            
            // Update connected server info
            if (status.server) {
                document.getElementById('connectedServer').textContent = 
                    `${status.server.name} (${status.server.location})`;
            }
        } else {
            connectBtn.className = 'connect-btn';
            connectBtnText.textContent = 'Connect';
            connectBtn.querySelector('i').className = 'fas fa-power-off';
            
            // Hide stats panel
            statsPanel.style.display = 'none';
            this.stopStatsUpdates();
        }

        this.isConnected = status.connected;
    }

    async toggleConnection() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const connectBtn = document.getElementById('connectBtn');
        const connectBtnText = connectBtn.querySelector('span');

        if (this.isConnected) {
            // Disconnect
            try {
                const response = await fetch('/api/disconnect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.updateStatus();
                }
            } catch (error) {
                console.error('Failed to disconnect:', error);
            }
        } else {
            // Connect
            if (!this.selectedServer) {
                alert('Please select a server first');
                return;
            }

            // Show loading overlay
            loadingOverlay.style.display = 'flex';
            
            // Update button to connecting state
            connectBtn.className = 'connect-btn connecting';
            connectBtnText.textContent = 'Connecting...';
            connectBtn.querySelector('i').className = 'fas fa-spinner fa-spin';

            try {
                const response = await fetch('/api/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        server_id: this.selectedServer.id
                    })
                });

                if (response.ok) {
                    this.connectStartTime = new Date();
                    
                    // Wait for connection to establish
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                        this.updateStatus();
                    }, 2500);
                } else {
                    throw new Error('Connection failed');
                }
            } catch (error) {
                console.error('Failed to connect:', error);
                loadingOverlay.style.display = 'none';
                
                // Reset button state
                connectBtn.className = 'connect-btn';
                connectBtnText.textContent = 'Connect';
                connectBtn.querySelector('i').className = 'fas fa-power-off';
                
                alert('Failed to connect to VPN. Please try again.');
            }
        }
    }

    startStatusPolling() {
        // Poll status every 5 seconds
        setInterval(() => {
            this.updateStatus();
        }, 5000);
    }

    async startStatsUpdates() {
        if (this.statsTimer) return;

        this.statsTimer = setInterval(async () => {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                // Update data usage
                document.getElementById('dataSent').textContent = 
                    this.formatBytes(stats.data_sent);
                document.getElementById('dataReceived').textContent = 
                    this.formatBytes(stats.data_received);
                
                // Update connection time
                if (this.connectStartTime) {
                    const now = new Date();
                    const diff = now - this.connectStartTime;
                    document.getElementById('connectedTime').textContent = 
                        this.formatTime(diff);
                }
                
            } catch (error) {
                console.error('Failed to update stats:', error);
            }
        }, 1000);
    }

    stopStatsUpdates() {
        if (this.statsTimer) {
            clearInterval(this.statsTimer);
            this.statsTimer = null;
        }
        this.connectStartTime = null;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Global function for button onclick
function toggleConnection() {
    vpnApp.toggleConnection();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vpnApp = new VPNApp();
});

// Add some nice animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add loading animation to features
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
});