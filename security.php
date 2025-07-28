<?php
/**
 * Security and Rate Limiting Class for 17yotk MC Server
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

class Security {
    private static $instance = null;
    private $rateLimit = [];
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Apply security headers
     */
    public function applySecurityHeaders() {
        foreach (SECURITY_HEADERS as $header => $value) {
            header("$header: $value");
        }
        
        // Additional security headers
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }
    
    /**
     * Rate limiting check
     */
    public function checkRateLimit($identifier = null, $limit = null, $window = null) {
        $identifier = $identifier ?: $this->getClientIdentifier();
        $limit = $limit ?: RATE_LIMIT_REQUESTS;
        $window = $window ?: RATE_LIMIT_WINDOW;
        
        $now = time();
        $key = "rate_limit_$identifier";
        
        // Clean old entries
        if (isset($this->rateLimit[$key])) {
            $this->rateLimit[$key] = array_filter(
                $this->rateLimit[$key],
                function($timestamp) use ($now, $window) {
                    return ($now - $timestamp) < $window;
                }
            );
        } else {
            $this->rateLimit[$key] = [];
        }
        
        // Check if limit exceeded
        if (count($this->rateLimit[$key]) >= $limit) {
            http_response_code(429);
            header('Retry-After: ' . $window);
            echo json_encode([
                'success' => false,
                'error' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $window
            ]);
            exit;
        }
        
        // Add current request
        $this->rateLimit[$key][] = $now;
        
        return true;
    }
    
    /**
     * Get client identifier for rate limiting
     */
    private function getClientIdentifier() {
        $ip = $this->getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        return hash('sha256', $ip . $userAgent);
    }
    
    /**
     * Get real client IP
     */
    public function getClientIP() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    /**
     * Sanitize input data
     */
    public function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeInput'], $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email
     */
    public function validateEmail($email) {
        $email = filter_var(trim($email), FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            return false;
        }
        
        // Check for common disposable email domains
        $disposableDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'temp-mail.org'
        ];
        
        $domain = strtolower(substr(strrchr($email, "@"), 1));
        
        if (in_array($domain, $disposableDomains)) {
            return false;
        }
        
        return $email;
    }
    
    /**
     * Validate Minecraft username
     */
    public function validateMinecraftUsername($username) {
        // Minecraft usernames: 3-16 characters, alphanumeric and underscore only
        if (!preg_match('/^[a-zA-Z0-9_]{3,16}$/', $username)) {
            return false;
        }
        
        // Check for reserved names
        $reserved = ['admin', 'administrator', 'root', 'console', 'server'];
        
        if (in_array(strtolower($username), $reserved)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Generate CSRF token
     */
    public function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_time'] = time();
        
        return $token;
    }
    
    /**
     * Verify CSRF token
     */
    public function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_time'])) {
            return false;
        }
        
        // Token expires after 1 hour
        if (time() - $_SESSION['csrf_time'] > 3600) {
            unset($_SESSION['csrf_token'], $_SESSION['csrf_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Log security event
     */
    public function logSecurityEvent($event, $details = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => $this->getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details' => $details
        ];
        
        $logMessage = json_encode($logData) . "\n";
        
        if (LOG_ERRORS) {
            error_log($logMessage, 3, LOG_FILE);
        }
    }
    
    /**
     * Check for suspicious activity
     */
    public function detectSuspiciousActivity($data) {
        $suspicious = false;
        $reasons = [];
        
        // Check for SQL injection patterns
        $sqlPatterns = [
            '/union\s+select/i',
            '/drop\s+table/i',
            '/insert\s+into/i',
            '/delete\s+from/i',
            '/update\s+set/i',
            '/\'\s*or\s*\'/i',
            '/\'\s*and\s*\'/i'
        ];
        
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                foreach ($sqlPatterns as $pattern) {
                    if (preg_match($pattern, $value)) {
                        $suspicious = true;
                        $reasons[] = "SQL injection pattern in $key";
                    }
                }
                
                // Check for XSS patterns
                if (preg_match('/<script|javascript:|on\w+\s*=/i', $value)) {
                    $suspicious = true;
                    $reasons[] = "XSS pattern in $key";
                }
                
                // Check for excessive length
                if (strlen($value) > 1000) {
                    $suspicious = true;
                    $reasons[] = "Excessive length in $key";
                }
            }
        }
        
        if ($suspicious) {
            $this->logSecurityEvent('suspicious_activity', [
                'reasons' => $reasons,
                'data' => $data
            ]);
        }
        
        return $suspicious;
    }
}
?>