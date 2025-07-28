-- ========================================
-- ГОТОВЫЙ SQL КОД ДЛЯ ВЫПОЛНЕНИЯ
-- ========================================

USE a17yotknet_minecraft_site;

-- Удаляем таблицы если существуют (осторожно!)
DROP TABLE IF EXISTS privilege_features;
DROP TABLE IF EXISTS privileges;
DROP TABLE IF EXISTS game_items;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS server_info;
DROP TABLE IF EXISTS server_stats;

-- ========================================
-- СОЗДАНИЕ ТАБЛИЦ
-- ========================================

CREATE TABLE privileges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    description TEXT,
    duration_type ENUM('permanent', 'days', 'months') DEFAULT 'permanent',
    duration_value INT DEFAULT NULL,
    color VARCHAR(20) DEFAULT '#6c5ce7',
    icon VARCHAR(50) DEFAULT 'fas fa-crown',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE privilege_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    privilege_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_description TEXT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (privilege_id) REFERENCES privileges(id) ON DELETE CASCADE
);

CREATE TABLE game_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    description TEXT,
    category ENUM('coins', 'tools', 'armor', 'house', 'pets', 'resources', 'other') DEFAULT 'other',
    icon VARCHAR(50) DEFAULT 'fas fa-cube',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(100) DEFAULT 'Администрация',
    category ENUM('update', 'event', 'announcement', 'maintenance', 'other') DEFAULT 'other',
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255),
    views_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE server_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    description VARCHAR(255),
    data_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    is_public BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE server_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    online_players INT DEFAULT 0,
    max_players INT DEFAULT 100,
    server_status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
    version VARCHAR(50) DEFAULT '1.20.1',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- ВСТАВКА ДАННЫХ
-- ========================================

-- Привилегии
INSERT INTO privileges (name, display_name, price, description, color, icon, sort_order) VALUES
('vip', 'VIP', 199.00, 'Базовые VIP привилегии для комфортной игры', '#ffd700', 'fas fa-star', 1),
('premium', 'PREMIUM', 399.00, 'Расширенные привилегии для продвинутых игроков', '#ff6b6b', 'fas fa-gem', 2),
('elite', 'ELITE', 699.00, 'Продвинутые привилегии для элитных игроков', '#4ecdc4', 'fas fa-crown', 3),
('legend', 'LEGEND', 999.00, 'Максимальные привилегии для легендарных игроков', '#a8e6cf', 'fas fa-trophy', 4);

-- Возможности для VIP
INSERT INTO privilege_features (privilege_id, feature_name, feature_description, sort_order) VALUES
(1, 'Префикс [VIP] в чате', 'Уникальный префикс перед вашим ником', 1),
(1, 'Цветной ник в игре', 'Возможность использовать цвета в нике', 2),
(1, '5 дополнительных домов', 'Установка до 5 точек дома', 3),
(1, 'Команда /fly на 30 минут', 'Полёт в выживании на 30 минут в день', 4),
(1, 'Доступ к VIP региону', 'Эксклюзивная территория для VIP игроков', 5),
(1, 'VIP кит раз в день', 'Набор полезных предметов каждый день', 6);

-- Возможности для PREMIUM
INSERT INTO privilege_features (privilege_id, feature_name, feature_description, sort_order) VALUES
(2, 'Все привилегии VIP', 'Включает все возможности VIP статуса', 1),
(2, 'Префикс [PREMIUM]', 'Уникальный премиум префикс', 2),
(2, '15 дополнительных домов', 'Установка до 15 точек дома', 3),
(2, 'Команда /fly на 1 час', 'Полёт в выживании на 1 час в день', 4),
(2, 'Кит с алмазной броней', 'Полный комплект алмазной брони', 5),
(2, 'Приоритет входа на сервер', 'Вход на сервер без очереди', 6),
(2, 'Доступ к /heal и /feed', 'Восстановление здоровья и голода', 7);

-- Возможности для ELITE
INSERT INTO privilege_features (privilege_id, feature_name, feature_description, sort_order) VALUES
(3, 'Все привилегии PREMIUM', 'Включает все возможности PREMIUM статуса', 1),
(3, 'Префикс [ELITE]', 'Элитный префикс для избранных', 2),
(3, 'Безлимитные дома', 'Неограниченное количество точек дома', 3),
(3, 'Постоянный /fly', 'Неограниченный полёт в выживании', 4),
(3, 'Кит с незеритовой броней', 'Полный комплект незеритовой брони', 5),
(3, 'Личный регион 100x100', 'Приватная территория 100 на 100 блоков', 6),
(3, 'Команды творчества', 'Доступ к некоторым креативным командам', 7);

-- Возможности для LEGEND
INSERT INTO privilege_features (privilege_id, feature_name, feature_description, sort_order) VALUES
(4, 'Все привилегии ELITE', 'Включает все возможности ELITE статуса', 1),
(4, 'Префикс [LEGEND]', 'Легендарный префикс высшего уровня', 2),
(4, 'Уникальные эффекты частиц', 'Эксклюзивные визуальные эффекты', 3),
(4, 'Доступ к админ командам', 'Расширенные административные возможности', 4),
(4, 'Личный регион 200x200', 'Огромная приватная территория', 5),
(4, 'Особый чат канал', 'Доступ к приватному чату для легенд', 6),
(4, 'Создание варпов', 'Возможность создавать точки телепортации', 7);

-- Игровые товары
INSERT INTO game_items (name, display_name, price, category, description, icon, sort_order) VALUES
('coins_1000', 'Монеты 1000', 99.00, 'coins', '1000 игровых монет для покупок в игре', 'fas fa-coins', 1),
('coins_2500', 'Монеты 2500', 199.00, 'coins', '2500 игровых монет с бонусом', 'fas fa-coins', 2),
('coins_5000', 'Монеты 5000', 399.00, 'coins', '5000 игровых монет + 500 бонусных', 'fas fa-coins', 3),
('diamond_tools', 'Набор алмазных инструментов', 149.00, 'tools', 'Полный набор зачарованных алмазных инструментов', 'fas fa-tools', 4),
('netherite_armor', 'Незеритовая броня', 299.00, 'armor', 'Полный комплект зачарованной незеритовой брони', 'fas fa-shield-alt', 5),
('starter_house', 'Стартовый дом', 199.00, 'house', 'Готовый дом с мебелью и сундуками', 'fas fa-home', 6);

-- Информация о сервере
INSERT INTO server_info (key_name, key_value, description, data_type, is_public) VALUES
('server_name', '17yotk MC Server', 'Название сервера', 'text', TRUE),
('server_description', 'Лучший Minecraft сервер с уникальными возможностями и дружелюбным сообществом!', 'Описание сервера', 'text', TRUE),
('server_ip', '199.83.103.226:25663', 'IP адрес сервера', 'text', TRUE),
('server_version', '1.20.1', 'Версия Minecraft', 'text', TRUE),
('max_players', '100', 'Максимальное количество игроков', 'number', TRUE),
('website_url', 'https://17yotk.ru', 'Официальный сайт', 'text', TRUE),
('discord_url', 'https://discord.gg/17yotk', 'Discord сервер', 'text', TRUE),
('support_email', 'support@17yotk.ru', 'Email поддержки', 'text', TRUE);

-- Новости
INSERT INTO news (title, content, excerpt, category, is_published, is_featured, published_at) VALUES
('Добро пожаловать на 17yotk MC Server!', 
'Мы рады приветствовать вас на нашем сервере! Здесь вас ждут увлекательные приключения, дружелюбное сообщество и множество уникальных возможностей.', 
'Добро пожаловать на лучший Minecraft сервер!', 
'announcement', TRUE, TRUE, NOW()),

('Обновление сервера до версии 1.20.1', 
'Мы обновили наш сервер до последней версии Minecraft 1.20.1! Новые блоки, предметы и улучшенная производительность.', 
'Сервер обновлен до Minecraft 1.20.1', 
'update', TRUE, FALSE, NOW() - INTERVAL 1 DAY),

('Скидки на донат привилегии!', 
'Только до конца месяца действуют специальные скидки на все донат привилегии! VIP: -20%, PREMIUM: -25%, ELITE: -30%, LEGEND: -35%', 
'Специальные скидки на все привилегии!', 
'event', TRUE, TRUE, NOW() - INTERVAL 2 DAY);

-- Статистика сервера
INSERT INTO server_stats (online_players, max_players, server_status, version) VALUES
(42, 100, 'online', '1.20.1');

-- Индексы
CREATE INDEX idx_privileges_active ON privileges(is_active, sort_order);
CREATE INDEX idx_privilege_features_privilege ON privilege_features(privilege_id, sort_order);
CREATE INDEX idx_game_items_active ON game_items(is_active, category, sort_order);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_server_info_public ON server_info(is_public, key_name);

-- ========================================
-- ГОТОВО!
-- ========================================