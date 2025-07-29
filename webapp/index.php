<?php
session_start();

// VPN Server Data
$vpn_servers = [
    'us-east' => [
        'name' => 'United States',
        'city' => 'New York',
        'flag' => '🇺🇸',
        'ping' => 23,
        'load' => 15,
        'ip' => '192.168.1.100',
        'coords' => [40.7128, -74.0060]
    ],
    'us-west' => [
        'name' => 'United States',
        'city' => 'Los Angeles',
        'flag' => '🇺🇸',
        'ping' => 31,
        'load' => 45,
        'ip' => '192.168.1.101',
        'coords' => [34.0522, -118.2437]
    ],
    'uk' => [
        'name' => 'United Kingdom',
        'city' => 'London',
        'flag' => '🇬🇧',
        'ping' => 89,
        'load' => 28,
        'ip' => '192.168.1.102',
        'coords' => [51.5074, -0.1278]
    ],
    'germany' => [
        'name' => 'Germany',
        'city' => 'Frankfurt',
        'flag' => '🇩🇪',
        'ping' => 76,
        'load' => 33,
        'ip' => '192.168.1.103',
        'coords' => [50.1109, 8.6821]
    ],
    'japan' => [
        'name' => 'Japan',
        'city' => 'Tokyo',
        'flag' => '🇯🇵',
        'ping' => 145,
        'load' => 52,
        'ip' => '192.168.1.104',
        'coords' => [35.6762, 139.6503]
    ],
    'australia' => [
        'name' => 'Australia',
        'city' => 'Sydney',
        'flag' => '🇦🇺',
        'ping' => 189,
        'load' => 41,
        'ip' => '192.168.1.105',
        'coords' => [-33.8688, 151.2093]
    ],
    'canada' => [
        'name' => 'Canada',
        'city' => 'Toronto',
        'flag' => '🇨🇦',
        'ping' => 38,
        'load' => 19,
        'ip' => '192.168.1.106',
        'coords' => [43.6532, -79.3832]
    ],
    'singapore' => [
        'name' => 'Singapore',
        'city' => 'Singapore',
        'flag' => '🇸🇬',
        'ping' => 167,
        'load' => 36,
        'ip' => '192.168.1.107',
        'coords' => [1.3521, 103.8198]
    ]
];

// Handle AJAX requests
if (isset($_POST['action'])) {
    header('Content-Type: application/json');
    
    switch ($_POST['action']) {
        case 'connect':
            $server = $_POST['server'] ?? '';
            if (isset($vpn_servers[$server])) {
                $_SESSION['connected'] = true;
                $_SESSION['server'] = $server;
                $_SESSION['connect_time'] = time();
                echo json_encode([
                    'success' => true,
                    'message' => 'Connected to ' . $vpn_servers[$server]['name'],
                    'server' => $vpn_servers[$server]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid server']);
            }
            exit;
            
        case 'disconnect':
            $_SESSION['connected'] = false;
            unset($_SESSION['server'], $_SESSION['connect_time']);
            echo json_encode(['success' => true, 'message' => 'Disconnected']);
            exit;
            
        case 'status':
            $connected = $_SESSION['connected'] ?? false;
            $current_server = null;
            $connect_time = 0;
            
            if ($connected && isset($_SESSION['server'])) {
                $current_server = $vpn_servers[$_SESSION['server']];
                $connect_time = time() - ($_SESSION['connect_time'] ?? time());
            }
            
            echo json_encode([
                'connected' => $connected,
                'server' => $current_server,
                'connect_time' => $connect_time,
                'real_ip' => '203.45.67.89'
            ]);
            exit;
    }
}

$connected = $_SESSION['connected'] ?? false;
$current_server = null;
if ($connected && isset($_SESSION['server'])) {
    $current_server = $vpn_servers[$_SESSION['server']];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SecureVPN Pro - Ultimate Privacy Protection</title>
    <style>
        /* Font icons using Unicode symbols instead of FontAwesome */
        .fa-shield-alt:before { content: "🛡️"; }
        .fa-globe:before { content: "🌍"; }
        .fa-power-off:before { content: "⏻"; }
        .fa-clock:before { content: "⏰"; }
        .fa-shield-virus:before { content: "🔒"; }
        .fa-user-secret:before { content: "👤"; }
        .fa-bolt:before { content: "⚡"; }
        .fa-globe-americas:before { content: "🌎"; }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d2d5f 100%);
            color: white;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .header {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
            font-weight: 700;
            color: #00ff88;
        }

        .logo i {
            font-size: 2rem;
            background: linear-gradient(45deg, #00ff88, #00ccff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .connection-status {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .status-dot.connected { background: #00ff88; }
        .status-dot.disconnected { background: #ff4757; }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
        }

        .main-container {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 2rem;
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .vpn-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .current-location {
            text-align: center;
            margin-bottom: 2rem;
        }

        .location-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 1rem;
        }

        .country-flag {
            font-size: 3rem;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .location-details h2 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            color: #00ff88;
        }

        .location-details p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
        }

        .ip-display {
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 12px;
            margin: 1rem 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ip-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 0.5rem;
        }

        .ip-address {
            font-family: 'Courier New', monospace;
            font-size: 1.3rem;
            font-weight: 600;
            color: #00ccff;
        }

        .connect-button {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ff4757, #ff3838);
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 2rem auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 15px 30px rgba(255, 71, 87, 0.4);
            position: relative;
            overflow: hidden;
        }

        .connect-button:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 40px rgba(255, 71, 87, 0.6);
        }

        .connect-button.connected {
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            box-shadow: 0 15px 30px rgba(0, 255, 136, 0.4);
        }

        .connect-button.connected:hover {
            box-shadow: 0 20px 40px rgba(0, 255, 136, 0.6);
        }

        .connect-button i {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 2rem;
        }

        .stat-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #00ff88;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .server-list {
            max-height: 600px;
            overflow-y: auto;
        }

        .server-list h3 {
            margin-bottom: 1.5rem;
            color: #00ff88;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .server-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .server-item:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #00ff88;
            transform: translateX(5px);
        }

        .server-item.selected {
            background: rgba(0, 255, 136, 0.1);
            border-color: #00ff88;
        }

        .server-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .server-flag {
            font-size: 2rem;
        }

        .server-details h4 {
            font-size: 1.1rem;
            margin-bottom: 0.3rem;
            color: white;
        }

        .server-details p {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .server-stats {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 5px;
        }

        .ping {
            font-size: 0.9rem;
            color: #00ccff;
            font-weight: 600;
        }

        .load-indicator {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .load-bar {
            width: 40px;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        .load-fill {
            height: 100%;
            transition: width 0.3s ease;
        }

        .load-low { background: #00ff88; }
        .load-medium { background: #ffa502; }
        .load-high { background: #ff4757; }

        .world-map {
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><rect width="1000" height="500" fill="%23001122"/><circle cx="200" cy="150" r="3" fill="%2300ff88"/><circle cx="800" cy="200" r="3" fill="%2300ccff"/><circle cx="500" cy="180" r="3" fill="%23ffa502"/><circle cx="150" cy="300" r="3" fill="%23ff4757"/><circle cx="750" cy="350" r="3" fill="%2300ff88"/></svg>') center/cover;
            height: 200px;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .connection-time {
            text-align: center;
            margin-top: 1rem;
            font-size: 1.1rem;
            color: #00ccff;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
            grid-column: 1 / -1;
        }

        .feature-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-item i {
            font-size: 2.5rem;
            color: #00ff88;
            margin-bottom: 1rem;
        }

        .feature-item h4 {
            margin-bottom: 0.5rem;
            color: white;
        }

        .feature-item p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .main-container {
                grid-template-columns: 1fr;
                padding: 1rem;
            }
            
            .header {
                padding: 1rem;
            }
            
            .connect-button {
                width: 150px;
                height: 150px;
            }
        }

        .loading {
            pointer-events: none;
            opacity: 0.7;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            margin: -15px 0 0 -15px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">
            <i class="fas fa-shield-alt"></i>
            <span>SecureVPN Pro</span>
        </div>
        <div class="connection-status">
            <div class="status-dot <?php echo $connected ? 'connected' : 'disconnected'; ?>"></div>
            <span><?php echo $connected ? 'Protected' : 'Unprotected'; ?></span>
        </div>
    </header>

    <div class="main-container">
        <div class="vpn-panel">
            <div class="current-location">
                <div class="location-info">
                    <div class="country-flag">
                        <?php echo $connected && $current_server ? $current_server['flag'] : '🌐'; ?>
                    </div>
                    <div class="location-details">
                        <h2><?php echo $connected && $current_server ? $current_server['name'] : 'Not Connected'; ?></h2>
                        <p><?php echo $connected && $current_server ? $current_server['city'] : 'Your real location is exposed'; ?></p>
                    </div>
                </div>
                
                <div class="ip-display">
                    <div class="ip-label">Your IP Address:</div>
                    <div class="ip-address" id="currentIP">
                        <?php echo $connected && $current_server ? $current_server['ip'] : '203.45.67.89'; ?>
                    </div>
                </div>
            </div>

            <button class="connect-button <?php echo $connected ? 'connected' : ''; ?>" id="connectBtn">
                <i class="fas fa-power-off"></i>
                <span><?php echo $connected ? 'DISCONNECT' : 'CONNECT'; ?></span>
            </button>

            <?php if ($connected): ?>
            <div class="connection-time">
                <i class="fas fa-clock"></i>
                Connected for: <span id="connectionTime">00:00:00</span>
            </div>
            <?php endif; ?>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value" id="downloadSpeed">0 MB/s</div>
                    <div class="stat-label">Download</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="uploadSpeed">0 MB/s</div>
                    <div class="stat-label">Upload</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="dataUsed">0 GB</div>
                    <div class="stat-label">Data Used</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="serverLoad"><?php echo $connected && $current_server ? $current_server['load'] . '%' : '0%'; ?></div>
                    <div class="stat-label">Server Load</div>
                </div>
            </div>
        </div>

        <div class="vpn-panel">
            <div class="world-map"></div>
            
            <div class="server-list">
                <h3><i class="fas fa-globe"></i> Select Server Location</h3>
                
                <?php foreach ($vpn_servers as $key => $server): ?>
                <div class="server-item <?php echo ($connected && $_SESSION['server'] === $key) ? 'selected' : ''; ?>" 
                     data-server="<?php echo $key; ?>">
                    <div class="server-info">
                        <div class="server-flag"><?php echo $server['flag']; ?></div>
                        <div class="server-details">
                            <h4><?php echo $server['name']; ?></h4>
                            <p><?php echo $server['city']; ?></p>
                        </div>
                    </div>
                    <div class="server-stats">
                        <div class="ping"><?php echo $server['ping']; ?>ms</div>
                        <div class="load-indicator">
                            <div class="load-bar">
                                <div class="load-fill <?php 
                                    echo $server['load'] < 30 ? 'load-low' : 
                                         ($server['load'] < 70 ? 'load-medium' : 'load-high'); 
                                ?>" style="width: <?php echo $server['load']; ?>%"></div>
                            </div>
                            <span><?php echo $server['load']; ?>%</span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="features">
            <div class="feature-item">
                <i class="fas fa-shield-virus"></i>
                <h4>Military-Grade Encryption</h4>
                <p>AES-256 encryption protects your data from hackers and surveillance</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-user-secret"></i>
                <h4>No-Log Policy</h4>
                <p>We don't track, collect, or store your online activity</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-bolt"></i>
                <h4>Lightning Fast</h4>
                <p>Optimized servers for maximum speed and performance</p>
            </div>
            <div class="feature-item">
                <i class="fas fa-globe-americas"></i>
                <h4>Global Network</h4>
                <p>Access content from anywhere with our worldwide server network</p>
            </div>
        </div>
    </div>

    <script>
        let connected = <?php echo $connected ? 'true' : 'false'; ?>;
        let selectedServer = '<?php echo $connected ? ($_SESSION['server'] ?? '') : ''; ?>';
        let connectTime = <?php echo $connected && isset($_SESSION['connect_time']) ? time() - $_SESSION['connect_time'] : 0; ?>;

        // Update connection time
        function updateConnectionTime() {
            if (connected) {
                const hours = Math.floor(connectTime / 3600);
                const minutes = Math.floor((connectTime % 3600) / 60);
                const seconds = connectTime % 60;
                
                document.getElementById('connectionTime').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                connectTime++;
            }
        }

        // Update stats simulation
        function updateStats() {
            if (connected) {
                document.getElementById('downloadSpeed').textContent = (Math.random() * 50 + 10).toFixed(1) + ' MB/s';
                document.getElementById('uploadSpeed').textContent = (Math.random() * 20 + 5).toFixed(1) + ' MB/s';
                document.getElementById('dataUsed').textContent = (Math.random() * 5 + 1).toFixed(2) + ' GB';
            } else {
                document.getElementById('downloadSpeed').textContent = '0 MB/s';
                document.getElementById('uploadSpeed').textContent = '0 MB/s';
                document.getElementById('dataUsed').textContent = '0 GB';
            }
        }

        // Server selection
        document.querySelectorAll('.server-item').forEach(item => {
            item.addEventListener('click', function() {
                if (!connected) {
                    document.querySelectorAll('.server-item').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedServer = this.dataset.server;
                }
            });
        });

        // Connect/Disconnect button
        document.getElementById('connectBtn').addEventListener('click', function() {
            const button = this;
            
            if (connected) {
                // Disconnect
                button.classList.add('loading');
                
                fetch('', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: 'action=disconnect'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    }
                });
            } else {
                // Connect
                if (!selectedServer) {
                    alert('Please select a server first!');
                    return;
                }
                
                button.classList.add('loading');
                
                fetch('', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: `action=connect&server=${selectedServer}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    }
                });
            }
        });

        // Start timers
        if (connected) {
            setInterval(updateConnectionTime, 1000);
        }
        setInterval(updateStats, 2000);

        // Initial stats update
        updateStats();
    </script>
</body>
</html>