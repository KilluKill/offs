<?php
/**
 * Secure Configuration for 17yotk MC Server
 * This file should be placed outside web root or protected by .htaccess
 */

// Prevent direct access
if (!defined('SECURE_ACCESS')) {
    die('Direct access not allowed');
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'a17yotknet_minecraft_site');
define('DB_USER', 'a17yotknet_admin');
define('DB_PASS', 'A31204992306a');
define('DB_CHARSET', 'utf8mb4');

// Security Settings
define('RATE_LIMIT_REQUESTS', 10); // Max requests per minute
define('RATE_LIMIT_WINDOW', 60); // Time window in seconds
define('MAX_UPLOAD_SIZE', 1048576); // 1MB in bytes
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds

// Email Configuration
define('ADMIN_EMAIL', 'admin@17yotk.net');
define('FROM_EMAIL', 'noreply@17yotk.net');
define('SMTP_HOST', ''); // Leave empty to use mail() function
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('SMTP_ENCRYPTION', 'tls');

// API Configuration
define('API_RATE_LIMIT', 30); // Max API calls per minute
define('API_TOKEN_EXPIRY', 86400); // 24 hours
define('WEBHOOK_URL', ''); // Optional webhook for notifications

// Security Headers
define('SECURITY_HEADERS', [
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'X-XSS-Protection' => '1; mode=block',
    'Referrer-Policy' => 'strict-origin-when-cross-origin',
    'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self';"
]);

// Logging Configuration
define('LOG_ERRORS', true);
define('LOG_FILE', '/tmp/17yotk_errors.log');
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// Development/Production Mode
define('DEVELOPMENT_MODE', false); // Set to false in production
define('DEBUG_MODE', false); // Set to false in production

// Payment Configuration
define('ALLOWED_PAYMENT_METHODS', [
    'yoomoney',
    'qiwi', 
    'bank_card',
    'paypal',
    'bitcoin'
]);

define('MIN_DONATION_AMOUNT', 10); // Minimum donation in rubles
define('MAX_DONATION_AMOUNT', 50000); // Maximum donation in rubles

// Minecraft Server Configuration
define('MC_SERVER_IP', '199.83.103.226');
define('MC_SERVER_PORT', '25663');
define('MC_RCON_PASSWORD', ''); // RCON password if available

// File Upload Configuration
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('UPLOAD_PATH', '/uploads/');

// Cache Configuration
define('CACHE_ENABLED', true);
define('CACHE_DURATION', 300); // 5 minutes
define('CACHE_PATH', '/tmp/cache/');

?>