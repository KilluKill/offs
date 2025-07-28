<?php
/**
 * Database connection and API for 17yotk MC Server
 */

define('SECURE_ACCESS', true);
require_once 'config.php';
require_once 'security.php';

class Database {
    private $pdo;
    private $security;
    private $cache = [];
    
    public function __construct() {
        $this->security = Security::getInstance();
        $this->connectDatabase();
    }
    
    private function connectDatabase() {
        try {
            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=%s",
                DB_HOST,
                DB_NAME,
                DB_CHARSET
            );
            
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE utf8mb4_unicode_ci"
            ]);
            
            // Set SQL mode for better security
            $this->pdo->exec("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
            
        } catch (PDOException $e) {
            $this->security->logSecurityEvent('database_connection_failed', [
                'error' => $e->getMessage()
            ]);
            
            if (DEVELOPMENT_MODE) {
                die("Database connection failed: " . $e->getMessage());
            } else {
                die("Database connection failed. Please try again later.");
            }
        }
    }
    
    /**
     * Get cached data or fetch from database
     */
    private function getCachedData($key, $callback) {
        if (CACHE_ENABLED && isset($this->cache[$key])) {
            $cached = $this->cache[$key];
            if (time() - $cached['timestamp'] < CACHE_DURATION) {
                return $cached['data'];
            }
        }
        
        $data = $callback();
        
        if (CACHE_ENABLED) {
            $this->cache[$key] = [
                'data' => $data,
                'timestamp' => time()
            ];
        }
        
        return $data;
    }
    
    /**
     * Get all privileges with their features
     */
    public function getPrivileges() {
        return $this->getCachedData('privileges', function() {
            $sql = "SELECT p.*, 
                    GROUP_CONCAT(
                        CONCAT(pf.feature_name, '|', IFNULL(pf.feature_description, ''))
                        ORDER BY pf.sort_order SEPARATOR ';;'
                    ) as features
                    FROM privileges p
                    LEFT JOIN privilege_features pf ON p.id = pf.privilege_id
                    WHERE p.is_active = 1
                    GROUP BY p.id
                    ORDER BY p.sort_order";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            $privileges = $stmt->fetchAll();
            
            // Parse features
            foreach ($privileges as &$privilege) {
                $features = [];
                if ($privilege['features']) {
                    $featureList = explode(';;', $privilege['features']);
                    foreach ($featureList as $feature) {
                        $parts = explode('|', $feature);
                        $features[] = [
                            'name' => $parts[0],
                            'description' => isset($parts[1]) ? $parts[1] : ''
                        ];
                    }
                }
                $privilege['features'] = $features;
            }
            
            return $privileges;
        });
    }
    
    /**
     * Get all active game items
     */
    public function getGameItems() {
        $sql = "SELECT * FROM game_items 
                WHERE is_active = 1 
                ORDER BY category, sort_order";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }
    
    /**
     * Get published news
     */
    public function getNews($limit = 10, $featured_only = false) {
        $where = "WHERE is_published = 1";
        if ($featured_only) {
            $where .= " AND is_featured = 1";
        }
        
        $sql = "SELECT * FROM news 
                {$where}
                ORDER BY published_at DESC 
                LIMIT ?";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
    
    /**
     * Get server information
     */
    public function getServerInfo($key = null) {
        if ($key) {
            $sql = "SELECT key_value FROM server_info 
                    WHERE key_name = ? AND is_public = 1";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$key]);
            $result = $stmt->fetch();
            return $result ? $result['key_value'] : null;
        } else {
            $sql = "SELECT key_name, key_value, data_type FROM server_info 
                    WHERE is_public = 1";
            $stmt = $this->pdo->query($sql);
            $results = $stmt->fetchAll();
            
            $info = [];
            foreach ($results as $row) {
                $value = $row['key_value'];
                if ($row['data_type'] === 'json') {
                    $value = json_decode($value, true);
                } elseif ($row['data_type'] === 'number') {
                    $value = is_numeric($value) ? (float)$value : $value;
                } elseif ($row['data_type'] === 'boolean') {
                    $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                }
                $info[$row['key_name']] = $value;
            }
            return $info;
        }
    }
    
    /**
     * Get server statistics
     */
    public function getServerStats() {
        $sql = "SELECT * FROM server_stats ORDER BY last_updated DESC LIMIT 1";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetch();
    }
    
    /**
     * Update server statistics
     */
    public function updateServerStats($online_players, $max_players = null, $status = null) {
        $sql = "UPDATE server_stats SET 
                online_players = ?,
                max_players = COALESCE(?, max_players),
                server_status = COALESCE(?, server_status),
                last_updated = CURRENT_TIMESTAMP";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$online_players, $max_players, $status]);
    }
    
    /**
     * Get all data for frontend
     */
    public function getAllData() {
        return [
            'privileges' => $this->getPrivileges(),
            'game_items' => $this->getGameItems(),
            'news' => $this->getNews(5, true), // 5 featured news
            'server_info' => $this->getServerInfo(),
            'server_stats' => $this->getServerStats()
        ];
    }
}

// API endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $security = Security::getInstance();
    $security->applySecurityHeaders();
    $security->checkRateLimit(null, API_RATE_LIMIT, 60);
    
    header('Content-Type: application/json');
    
    $db = new Database();
    
    $action = $security->sanitizeInput($_GET['action'] ?? 'all');
    
    try {
        switch ($action) {
            case 'privileges':
                $data = $db->getPrivileges();
                break;
            case 'items':
                $data = $db->getGameItems();
                break;
            case 'news':
                $limit = (int)($_GET['limit'] ?? 10);
                $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';
                $data = $db->getNews($limit, $featured);
                break;
            case 'server_info':
                $key = $_GET['key'] ?? null;
                $data = $db->getServerInfo($key);
                break;
            case 'server_stats':
                $data = $db->getServerStats();
                break;
            case 'all':
            default:
                $data = $db->getAllData();
                break;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}
?>