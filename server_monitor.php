<?php
/**
 * Minecraft Server Monitor for 17yotk MC Server
 * Checks server status and updates database
 */

define('SECURE_ACCESS', true);
require_once 'config.php';
require_once 'security.php';
require_once 'database.php';

$security = Security::getInstance();
$security->applySecurityHeaders();

header('Content-Type: application/json; charset=utf-8');

/**
 * Check Minecraft server status using socket connection
 */
function checkMinecraftServer($host, $port, $timeout = 5) {
    $result = [
        'online' => false,
        'players' => 0,
        'max_players' => 0,
        'version' => '',
        'motd' => '',
        'latency' => 0
    ];
    
    $start_time = microtime(true);
    
    try {
        // Create socket connection
        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        
        if (!$socket) {
            return $result;
        }
        
        // Set timeout for socket operations
        stream_set_timeout($socket, $timeout);
        
        // Send handshake packet (Server List Ping)
        $packet = "\x00\x00" . pack('C', strlen($host)) . $host . pack('n', $port) . "\x01";
        $packet = pack('C', strlen($packet)) . $packet;
        
        fwrite($socket, $packet);
        
        // Send status request
        fwrite($socket, "\x01\x00");
        
        // Read response
        $response = fread($socket, 2048);
        fclose($socket);
        
        $latency = round((microtime(true) - $start_time) * 1000);
        
        if ($response) {
            $result['online'] = true;
            $result['latency'] = $latency;
            
            // Try to parse server response (simplified)
            // This is a basic implementation - real Minecraft protocol parsing is more complex
            if (strlen($response) > 10) {
                // Extract basic info from response
                $data = json_decode(substr($response, 5), true);
                
                if ($data && isset($data['players'])) {
                    $result['players'] = $data['players']['online'] ?? 0;
                    $result['max_players'] = $data['players']['max'] ?? 100;
                    $result['version'] = $data['version']['name'] ?? '';
                    $result['motd'] = $data['description']['text'] ?? '';
                }
            }
        }
        
    } catch (Exception $e) {
        error_log("Minecraft server check failed: " . $e->getMessage());
    }
    
    return $result;
}

/**
 * Alternative method using external API
 */
function checkServerViaAPI($host, $port) {
    $result = [
        'online' => false,
        'players' => 0,
        'max_players' => 0,
        'version' => '',
        'motd' => ''
    ];
    
    try {
        // Use mcsrvstat.us API as fallback
        $api_url = "https://api.mcsrvstat.us/2/{$host}:{$port}";
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => '17yotk-server-monitor'
            ]
        ]);
        
        $response = @file_get_contents($api_url, false, $context);
        
        if ($response) {
            $data = json_decode($response, true);
            
            if ($data && $data['online']) {
                $result['online'] = true;
                $result['players'] = $data['players']['online'] ?? 0;
                $result['max_players'] = $data['players']['max'] ?? 100;
                $result['version'] = $data['version'] ?? '';
                $result['motd'] = isset($data['motd']['clean']) ? 
                    implode(' ', $data['motd']['clean']) : '';
            }
        }
        
    } catch (Exception $e) {
        error_log("API server check failed: " . $e->getMessage());
    }
    
    return $result;
}

// Main execution
try {
    $host = MC_SERVER_IP;
    $port = (int)MC_SERVER_PORT;
    
    // Try direct socket connection first
    $status = checkMinecraftServer($host, $port);
    
    // If direct connection fails, try API
    if (!$status['online']) {
        $status = checkServerViaAPI($host, $port);
    }
    
    // Update database
    $db = new Database();
    $server_status = $status['online'] ? 'online' : 'offline';
    
    $db->updateServerStats(
        $status['players'],
        $status['max_players'],
        $server_status
    );
    
    // Return current status
    echo json_encode([
        'success' => true,
        'data' => [
            'server_status' => $server_status,
            'online_players' => $status['players'],
            'max_players' => $status['max_players'],
            'version' => $status['version'],
            'motd' => $status['motd'],
            'latency' => $status['latency'] ?? null,
            'last_updated' => date('Y-m-d H:i:s')
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => DEVELOPMENT_MODE ? $e->getMessage() : 'Server monitoring failed'
    ], JSON_UNESCAPED_UNICODE);
}
?>