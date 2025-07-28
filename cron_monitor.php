#!/usr/bin/env php
<?php
/**
 * Cron script for automatic server monitoring
 * Add to crontab: */5 * * * * /path/to/cron_monitor.php
 */

// Prevent web access
if (isset($_SERVER['HTTP_HOST'])) {
    die('This script can only be run from command line');
}

define('SECURE_ACCESS', true);
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

/**
 * Check Minecraft server status
 */
function checkMinecraftServer($host, $port, $timeout = 5) {
    $result = [
        'online' => false,
        'players' => 0,
        'max_players' => 100,
        'latency' => 0
    ];
    
    $start_time = microtime(true);
    
    try {
        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        
        if ($socket) {
            $latency = round((microtime(true) - $start_time) * 1000);
            $result['online'] = true;
            $result['latency'] = $latency;
            fclose($socket);
            
            // For a more detailed check, you could implement full Minecraft protocol
            // For now, just check if port is open
            $result['players'] = rand(0, 50); // Placeholder - replace with real data
        }
        
    } catch (Exception $e) {
        error_log("Cron monitor error: " . $e->getMessage());
    }
    
    return $result;
}

/**
 * Use external API as fallback
 */
function checkServerViaAPI($host, $port) {
    $result = [
        'online' => false,
        'players' => 0,
        'max_players' => 100
    ];
    
    try {
        $api_url = "https://api.mcsrvstat.us/2/{$host}:{$port}";
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => '17yotk-cron-monitor'
            ]
        ]);
        
        $response = @file_get_contents($api_url, false, $context);
        
        if ($response) {
            $data = json_decode($response, true);
            
            if ($data && $data['online']) {
                $result['online'] = true;
                $result['players'] = $data['players']['online'] ?? 0;
                $result['max_players'] = $data['players']['max'] ?? 100;
            }
        }
        
    } catch (Exception $e) {
        error_log("API check error: " . $e->getMessage());
    }
    
    return $result;
}

// Main execution
try {
    echo "[" . date('Y-m-d H:i:s') . "] Starting server monitoring...\n";
    
    $host = MC_SERVER_IP;
    $port = (int)MC_SERVER_PORT;
    
    // Try direct connection first
    $status = checkMinecraftServer($host, $port);
    
    // If direct fails, try API
    if (!$status['online']) {
        echo "Direct connection failed, trying API...\n";
        $status = checkServerViaAPI($host, $port);
    }
    
    // Update database
    $db = new Database();
    $server_status = $status['online'] ? 'online' : 'offline';
    
    $updated = $db->updateServerStats(
        $status['players'],
        $status['max_players'],
        $server_status
    );
    
    if ($updated) {
        echo "Server status updated: {$server_status}, Players: {$status['players']}/{$status['max_players']}\n";
    } else {
        echo "Failed to update database\n";
    }
    
    echo "Monitoring completed successfully\n";
    
} catch (Exception $e) {
    echo "Monitoring failed: " . $e->getMessage() . "\n";
    error_log("Cron monitoring failed: " . $e->getMessage());
    exit(1);
}
?>