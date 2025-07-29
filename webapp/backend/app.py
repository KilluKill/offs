from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import subprocess
import json
import os
import time
import threading
from datetime import datetime

app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)

# VPN configuration storage
vpn_configs = {}
vpn_status = {
    'connected': False,
    'server': None,
    'ip': None,
    'connected_at': None,
    'data_sent': 0,
    'data_received': 0
}

# Mock VPN servers for demonstration
vpn_servers = [
    {'id': 1, 'name': 'US East', 'location': 'New York', 'ping': 45, 'load': 23},
    {'id': 2, 'name': 'US West', 'location': 'Los Angeles', 'ping': 32, 'load': 67},
    {'id': 3, 'name': 'Europe', 'location': 'London', 'ping': 78, 'load': 34},
    {'id': 4, 'name': 'Asia', 'location': 'Tokyo', 'ping': 123, 'load': 45},
    {'id': 5, 'name': 'Canada', 'location': 'Toronto', 'ping': 56, 'load': 12}
]

def get_public_ip():
    """Get current public IP address"""
    try:
        result = subprocess.run(['curl', '-s', 'ifconfig.me'], capture_output=True, text=True, timeout=5)
        return result.stdout.strip() if result.returncode == 0 else '192.168.1.100'
    except:
        return '192.168.1.100'

def simulate_vpn_connection(server_id):
    """Simulate VPN connection process"""
    time.sleep(2)  # Simulate connection time
    server = next((s for s in vpn_servers if s['id'] == server_id), None)
    if server:
        vpn_status['connected'] = True
        vpn_status['server'] = server
        vpn_status['ip'] = f"10.{server_id}.{server_id}.{server_id}"
        vpn_status['connected_at'] = datetime.now().isoformat()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    """Get current VPN status"""
    if not vpn_status['connected']:
        vpn_status['ip'] = get_public_ip()
    return jsonify(vpn_status)

@app.route('/api/servers')
def get_servers():
    """Get available VPN servers"""
    return jsonify(vpn_servers)

@app.route('/api/connect', methods=['POST'])
def connect_vpn():
    """Connect to VPN server"""
    data = request.get_json()
    server_id = data.get('server_id')
    
    if not server_id:
        return jsonify({'error': 'Server ID required'}), 400
    
    server = next((s for s in vpn_servers if s['id'] == server_id), None)
    if not server:
        return jsonify({'error': 'Server not found'}), 404
    
    # Simulate connection in background
    threading.Thread(target=simulate_vpn_connection, args=(server_id,)).start()
    
    return jsonify({'message': 'Connecting to VPN...', 'server': server})

@app.route('/api/disconnect', methods=['POST'])
def disconnect_vpn():
    """Disconnect from VPN"""
    vpn_status['connected'] = False
    vpn_status['server'] = None
    vpn_status['ip'] = get_public_ip()
    vpn_status['connected_at'] = None
    
    return jsonify({'message': 'Disconnected from VPN'})

@app.route('/api/stats')
def get_stats():
    """Get VPN usage statistics"""
    import random
    vpn_status['data_sent'] += random.randint(100, 1000)
    vpn_status['data_received'] += random.randint(500, 2000)
    
    return jsonify({
        'data_sent': vpn_status['data_sent'],
        'data_received': vpn_status['data_received'],
        'uptime': vpn_status['connected_at']
    })

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('../static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)