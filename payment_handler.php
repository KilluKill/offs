<?php
/**
 * Payment Handler for 17yotk MC Server
 * Sends purchase data to admin for manual processing
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$required_fields = ['player_name', 'package_name', 'package_price', 'payment_method', 'email'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize data
$player_name = htmlspecialchars(trim($data['player_name']));
$package_name = htmlspecialchars(trim($data['package_name']));
$package_price = floatval($data['package_price']);
$payment_method = htmlspecialchars(trim($data['payment_method']));
$customer_email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
$transaction_id = isset($data['transaction_id']) ? htmlspecialchars(trim($data['transaction_id'])) : 'PENDING_' . time();

if (!$customer_email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email format']);
    exit;
}

// Validate player name (Minecraft username format)
if (!preg_match('/^[a-zA-Z0-9_]{3,16}$/', $player_name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid Minecraft username format']);
    exit;
}

try {
    // Save to database
    $order_id = savePurchaseToDatabase($data, $transaction_id);
    
    // Send email to admin
    $email_sent = sendAdminNotification($data, $transaction_id, $order_id);
    
    // Send confirmation to customer
    $customer_email_sent = sendCustomerConfirmation($data, $transaction_id, $order_id);
    
    if ($email_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Заказ принят! Данные отправлены администратору для обработки.',
            'order_id' => $order_id,
            'transaction_id' => $transaction_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка отправки уведомления администратору'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Payment handler error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}

/**
 * Save purchase to database
 */
function savePurchaseToDatabase($data, $transaction_id) {
    try {
        $pdo = new PDO(
            "mysql:host=localhost;dbname=a17yotknet_minecraft_site;charset=utf8mb4",
            "a17yotknet_admin",
            "A31204992306a",
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Create purchases table if not exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS purchases (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                transaction_id VARCHAR(100),
                player_name VARCHAR(16) NOT NULL,
                package_name VARCHAR(100) NOT NULL,
                package_price DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                customer_email VARCHAR(255) NOT NULL,
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP NULL
            )
        ");
        
        $order_id = 'ORDER_' . date('Ymd') . '_' . strtoupper(substr(md5(uniqid()), 0, 8));
        
        $stmt = $pdo->prepare("
            INSERT INTO purchases (order_id, transaction_id, player_name, package_name, package_price, payment_method, customer_email, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $notes = json_encode([
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
        $stmt->execute([
            $order_id,
            $transaction_id,
            $data['player_name'],
            $data['package_name'],
            $data['package_price'],
            $data['payment_method'],
            $data['email'],
            $notes
        ]);
        
        return $order_id;
        
    } catch (Exception $e) {
        error_log("Database error: " . $e->getMessage());
        throw $e;
    }
}

/**
 * Send email notification to admin
 */
function sendAdminNotification($data, $transaction_id, $order_id) {
    $admin_email = 'admin@17yotk.net';
    $subject = '[17yotk] Новая покупка доната - ' . $data['package_name'];
    
    $message = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .highlight { background: #ffeb3b; padding: 2px 5px; }
            .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>🎮 Новая покупка доната на 17yotk MC Server</h2>
        </div>
        
        <div class='content'>
            <div class='order-details'>
                <h3>📋 Детали заказа:</h3>
                <p><strong>ID заказа:</strong> <span class='highlight'>{$order_id}</span></p>
                <p><strong>ID транзакции:</strong> {$transaction_id}</p>
                <p><strong>Игрок:</strong> <span class='highlight'>{$data['player_name']}</span></p>
                <p><strong>Пакет:</strong> {$data['package_name']}</p>
                <p><strong>Цена:</strong> {$data['package_price']} ₽</p>
                <p><strong>Способ оплаты:</strong> {$data['payment_method']}</p>
                <p><strong>Email покупателя:</strong> {$data['email']}</p>
                <p><strong>Дата:</strong> " . date('d.m.Y H:i:s') . "</p>
            </div>
            
            <div class='order-details'>
                <h3>⚡ Действия для выдачи:</h3>
                <ol>
                    <li>Проверить оплату в системе {$data['payment_method']}</li>
                    <li>Войти на сервер Minecraft</li>
                    <li>Выполнить команды для игрока <strong>{$data['player_name']}</strong>:</li>
                </ol>
                
                <div style='background: #333; color: #0f0; padding: 10px; border-radius: 5px; font-family: monospace;'>
                    " . getMinecraftCommands($data['package_name'], $data['player_name']) . "
                </div>
            </div>
            
            <div class='order-details'>
                <h3>📧 Уведомление покупателя:</h3>
                <p>После выдачи привилегий отправьте подтверждение на: <strong>{$data['email']}</strong></p>
                <p>Шаблон сообщения: \"Привилегии {$data['package_name']} успешно выданы игроку {$data['player_name']}. Спасибо за поддержку сервера!\"</p>
            </div>
        </div>
        
        <div class='footer'>
            <p>17yotk MC Server - Система обработки донатов</p>
            <p>IP сервера: 199.83.103.226:25663</p>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: noreply@17yotk.ru',
        'Reply-To: noreply@17yotk.ru',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($admin_email, $subject, $message, implode("\r\n", $headers));
}

/**
 * Send confirmation email to customer
 */
function sendCustomerConfirmation($data, $transaction_id, $order_id) {
    $subject = 'Заказ принят - ' . $data['package_name'] . ' на 17yotk MC Server';
    
    $message = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>✅ Ваш заказ принят!</h2>
        </div>
        
        <div class='content'>
            <p>Здравствуйте!</p>
            <p>Спасибо за покупку на сервере <strong>17yotk MC Server</strong>!</p>
            
            <div class='order-info'>
                <h3>Информация о заказе:</h3>
                <p><strong>Номер заказа:</strong> {$order_id}</p>
                <p><strong>Игрок:</strong> {$data['player_name']}</p>
                <p><strong>Пакет:</strong> {$data['package_name']}</p>
                <p><strong>Цена:</strong> {$data['package_price']} ₽</p>
            </div>
            
            <p><strong>Что дальше?</strong></p>
            <ul>
                <li>Ваш заказ передан администратору для обработки</li>
                <li>Привилегии будут выданы в течение 24 часов</li>
                <li>Вы получите уведомление о выдаче на этот email</li>
            </ul>
            
            <p><strong>Подключение к серверу:</strong></p>
            <p>IP: <strong>199.83.103.226:25663</strong></p>
            <p>Версия: <strong>1.20.1</strong></p>
            
            <p>По всем вопросам обращайтесь: <a href='mailto:support@17yotk.ru'>support@17yotk.ru</a></p>
            
            <hr>
            <p style='font-size: 12px; color: #666;'>
                С уважением,<br>
                Команда 17yotk MC Server
            </p>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: noreply@17yotk.ru',
        'Reply-To: support@17yotk.ru'
    ];
    
    return mail($data['email'], $subject, $message, implode("\r\n", $headers));
}

/**
 * Get Minecraft commands for package
 */
function getMinecraftCommands($package_name, $player_name) {
    $commands = [
        'VIP' => [
            "lp user {$player_name} parent set vip",
            "give {$player_name} diamond 5",
            "eco give {$player_name} 1000"
        ],
        'PREMIUM' => [
            "lp user {$player_name} parent set premium",
            "give {$player_name} diamond_block 3",
            "eco give {$player_name} 2500"
        ],
        'ELITE' => [
            "lp user {$player_name} parent set elite",
            "give {$player_name} netherite_ingot 2",
            "eco give {$player_name} 5000"
        ],
        'LEGEND' => [
            "lp user {$player_name} parent set legend",
            "give {$player_name} nether_star 1",
            "eco give {$player_name} 10000"
        ],
        'Монеты 1000' => [
            "eco give {$player_name} 1000"
        ],
        'Монеты 2500' => [
            "eco give {$player_name} 2500"
        ],
        'Монеты 5000' => [
            "eco give {$player_name} 5000"
        ],
        'Набор алмазных инструментов' => [
            "give {$player_name} diamond_pickaxe{Enchantments:[{id:\"efficiency\",lvl:5},{id:\"unbreaking\",lvl:3}]} 1",
            "give {$player_name} diamond_axe{Enchantments:[{id:\"efficiency\",lvl:5},{id:\"unbreaking\",lvl:3}]} 1",
            "give {$player_name} diamond_shovel{Enchantments:[{id:\"efficiency\",lvl:5},{id:\"unbreaking\",lvl:3}]} 1"
        ],
        'Незеритовая броня' => [
            "give {$player_name} netherite_helmet{Enchantments:[{id:\"protection\",lvl:4},{id:\"unbreaking\",lvl:3}]} 1",
            "give {$player_name} netherite_chestplate{Enchantments:[{id:\"protection\",lvl:4},{id:\"unbreaking\",lvl:3}]} 1",
            "give {$player_name} netherite_leggings{Enchantments:[{id:\"protection\",lvl:4},{id:\"unbreaking\",lvl:3}]} 1",
            "give {$player_name} netherite_boots{Enchantments:[{id:\"protection\",lvl:4},{id:\"unbreaking\",lvl:3}]} 1"
        ],
        'Стартовый дом' => [
            "tp {$player_name} spawn",
            "give {$player_name} oak_log 64",
            "give {$player_name} cobblestone 128",
            "give {$player_name} glass 32"
        ]
    ];
    
    $package_commands = $commands[$package_name] ?? ["echo 'Команды для пакета {$package_name} не найдены'"];
    
    return implode("\n", $package_commands);
}
?>