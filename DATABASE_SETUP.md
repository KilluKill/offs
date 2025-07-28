# Настройка базы данных для 17yotk MC Server

## 📋 Данные для подключения

- **Сервер**: localhost
- **База данных**: `a17yotknet_minecraft_site`
- **Логин**: `a17yotknet_admin`
- **Пароль**: `A31204992306a`

## 🚀 Быстрая установка

### 1. Выполните SQL скрипт

Запустите файл `database_structure.sql` в вашей MySQL базе данных:

```bash
mysql -u a17yotknet_admin -p a17yotknet_minecraft_site < database_structure.sql
```

Или через phpMyAdmin:
1. Войдите в phpMyAdmin
2. Выберите базу данных `a17yotknet_minecraft_site`
3. Перейдите в раздел "SQL"
4. Скопируйте содержимое файла `database_structure.sql` и выполните

### 2. Загрузите файл database.php на сервер

Поместите файл `database.php` в корень вашего сайта.

### 3. Проверьте подключение

Откройте в браузере: `https://ваш-сайт.ru/database.php?action=all`

Если всё настроено правильно, вы увидите JSON с данными.

## 📊 Структура базы данных

### Таблицы:

1. **privileges** - Привилегии/статусы (VIP, PREMIUM, etc.)
2. **privilege_features** - Возможности каждой привилегии
3. **game_items** - Игровые товары (монеты, инструменты, etc.)
4. **news** - Новости сервера
5. **server_info** - Информация о сервере
6. **server_stats** - Статистика сервера (онлайн, статус)

## 🔧 API Endpoints

### Получение всех данных:
```
GET /database.php?action=all
```

### Получение только привилегий:
```
GET /database.php?action=privileges
```

### Получение только товаров:
```
GET /database.php?action=items
```

### Получение новостей:
```
GET /database.php?action=news&limit=5&featured=true
```

### Получение информации о сервере:
```
GET /database.php?action=server_info
GET /database.php?action=server_info&key=server_ip
```

### Получение статистики сервера:
```
GET /database.php?action=server_stats
```

## 📝 Управление данными

### Добавление новой привилегии:

```sql
-- Добавляем привилегию
INSERT INTO privileges (name, display_name, price, description, color, icon, sort_order) 
VALUES ('mvp', 'MVP', 1299.00, 'Эксклюзивные MVP привилегии', '#ff0080', 'fas fa-fire', 5);

-- Добавляем возможности (замените 5 на ID созданной привилегии)
INSERT INTO privilege_features (privilege_id, feature_name, feature_description, sort_order) VALUES
(5, 'Все привилегии LEGEND', 'Включает все возможности LEGEND статуса', 1),
(5, 'Префикс [MVP]', 'Эксклюзивный MVP префикс', 2),
(5, 'Особые эффекты', 'Уникальные визуальные эффекты', 3);
```

### Добавление игрового товара:

```sql
INSERT INTO game_items (name, display_name, price, category, description, icon, sort_order) 
VALUES ('mega_kit', 'Мега набор', 499.00, 'tools', 'Огромный набор всех инструментов', 'fas fa-toolbox', 10);
```

### Добавление новости:

```sql
INSERT INTO news (title, content, excerpt, category, is_published, is_featured, published_at) 
VALUES (
    'Новое обновление сервера!', 
    'Полное описание обновления...',
    'Краткое описание новости',
    'update', 
    TRUE, 
    TRUE, 
    NOW()
);
```

### Обновление информации о сервере:

```sql
-- Обновить IP сервера
UPDATE server_info SET key_value = '199.83.103.226:25663' WHERE key_name = 'server_ip';

-- Обновить описание
UPDATE server_info SET key_value = 'Новое описание сервера' WHERE key_name = 'server_description';
```

### Обновление статистики сервера:

```sql
UPDATE server_stats SET 
    online_players = 67, 
    server_status = 'online',
    last_updated = CURRENT_TIMESTAMP;
```

## 🎨 Кастомизация

### Цвета привилегий:
- VIP: `#ffd700` (золотой)
- PREMIUM: `#ff6b6b` (красный)
- ELITE: `#4ecdc4` (бирюзовый)
- LEGEND: `#a8e6cf` (зеленый)

### Иконки (Font Awesome):
- `fas fa-star` - звезда
- `fas fa-gem` - драгоценный камень
- `fas fa-crown` - корона
- `fas fa-trophy` - трофей
- `fas fa-fire` - огонь

### Категории товаров:
- `coins` - Игровая валюта
- `tools` - Инструменты
- `armor` - Броня
- `house` - Строения
- `pets` - Питомцы
- `resources` - Ресурсы
- `other` - Прочее

## 🔒 Безопасность

1. **Никогда не коммитьте database.php с реальными паролями в Git**
2. **Используйте HTTPS для API запросов**
3. **Регулярно делайте бэкапы базы данных**
4. **Ограничьте доступ к database.php только для вашего домена**

## 📱 Автоматическое обновление

Сайт автоматически загружает данные из базы при загрузке страницы. Все изменения в базе данных сразу отобразятся на сайте без необходимости редактировать код.

## 🛠 Отладка

Если возникают проблемы:

1. Проверьте подключение к базе: `database.php?action=server_stats`
2. Проверьте логи ошибок PHP
3. Убедитесь, что все таблицы созданы
4. Проверьте права доступа пользователя базы данных

## 📞 Поддержка

При возникновении проблем с настройкой базы данных:
- Проверьте синтаксис SQL запросов
- Убедитесь в корректности данных подключения
- Проверьте версию PHP (требуется PHP 7.4+)