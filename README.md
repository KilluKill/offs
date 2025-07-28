# 🎮 17yotk MC Server - Современная Платежная Система

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/17yotk/donation-system)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg)](manifest.json)
[![Mobile](https://img.shields.io/badge/Mobile-Optimized-orange.svg)](#мобильная-оптимизация)

Современная, полнофункциональная платежная система для Minecraft сервера с поддержкой множественных платежных провайдеров, PWA технологий и максимальной мобильной оптимизацией.

## 🚀 Основные возможности

### 💳 Платежные системы
- **Stripe** - Банковские карты (Visa, MasterCard, МИР)
- **PayPal** - Международные платежи
- **Robokassa** - Популярная система в РФ
- **YooMoney** - Яндекс.Деньги
- **QIWI** - Электронный кошелек
- **СБП** - Система быстрых платежей
- **Криптовалюты** - Bitcoin, Ethereum, USDT

### 🎨 Современный дизайн
- Темная тема с градиентами
- Анимации и эффекты частиц
- Адаптивная верстка для всех устройств
- CSS Grid и Flexbox
- Кастомные CSS переменные

### 📱 PWA поддержка
- Установка как нативное приложение
- Офлайн режим с Service Worker
- Push уведомления
- Background Sync для неудачных платежей
- Кэширование ресурсов

### 🔒 Безопасность
- SSL шифрование всех транзакций
- JWT токены для API
- Rate limiting
- Валидация данных на клиенте и сервере
- Защита от CSRF атак

### 🎯 UX/UI улучшения
- Мгновенная валидация форм
- Интерактивные уведомления
- Анимированные счетчики
- Particle эффекты при взаимодействии
- Плавная прокрутка и переходы

## 📦 Структура проекта

```
17yotk-donation-system/
├── 📄 index.html               # Донат магазин (главная страница)
├── 🎨 donate-styles.css        # Стили для магазина
├── ⚡ donate-script.js          # JavaScript функциональность
├── 📱 manifest.json            # PWA манифест
├── 🔧 sw.js                    # Service Worker для офлайн работы
├── ⚙️ api-config.example.js    # Пример конфигурации API
├── 📁 images/                  # Изображения и иконки
├── 📁 Logo/                    # Логотипы и favicon
├── 📁 fonts/                   # Веб-шрифты
└── 📁 video/                   # Фоновое видео (cloud.mp4)
```

## 🛠 Установка и настройка

### 1. Клонирование репозитория
```bash
git clone https://github.com/17yotk/donation-system.git
cd donation-system
```

### 2. Настройка frontend
1. Откройте `donate-script.js` и обновите конфигурацию:
```javascript
const CONFIG = {
    SERVER_IP: 'ваш-сервер.ru',
    API_ENDPOINT: 'https://ваш-api.ru/api/donations',
    STRIPE_PUBLIC_KEY: 'pk_live_ваш_stripe_ключ',
    PAYPAL_CLIENT_ID: 'ваш_paypal_id'
};
```

2. Обновите данные в `manifest.json`:
```json
{
    "name": "Ваш MC Server - Донат",
    "start_url": "/",
    "theme_color": "#ваш_цвет"
}
```

### 3. Настройка backend API

1. Скопируйте файл конфигурации:
```bash
cp api-config.example.js api-config.js
```

2. Заполните ваши данные в `api-config.js`:
```javascript
const API_CONFIG = {
    payments: {
        stripe: {
            secretKey: 'sk_live_ваш_секретный_ключ_stripe',
            webhookSecret: 'whsec_ваш_webhook_secret'
        },
        paypal: {
            clientId: 'ваш_paypal_client_id',
            clientSecret: 'ваш_paypal_secret'
        }
        // ... другие провайдеры
    }
};
```

### 4. Установка зависимостей backend
```bash
npm install express cors helmet
npm install stripe paypal-rest-sdk
npm install mongoose mysql2
npm install nodemailer discord.js
```

## 🎮 Интеграция с Minecraft

### Настройка RCON
1. В `server.properties`:
```properties
enable-rcon=true
rcon.port=25575
rcon.password=ваш_безопасный_пароль
```

2. В конфигурации API:
```javascript
minecraft: {
    server: {
        host: 'localhost',
        rconPort: 25575,
        rconPassword: 'ваш_rcon_пароль'
    }
}
```

### Команды для привилегий
Система автоматически выполняет команды при успешной оплате:
```javascript
commands: {
    VIP: [
        'lp user {player} parent set vip',
        'give {player} diamond 5',
        'eco give {player} 1000'
    ]
}
```

## 💰 Донат пакеты

| Пакет | Цена | Особенности |
|-------|------|-------------|
| **VIP** | 199₽ | Базовые привилегии, цветной ник |
| **PREMIUM** | 399₽ | Расширенные возможности, приоритет |
| **ELITE** | 699₽ | Продвинутые команды, регион |
| **LEGEND** | 999₽ | Максимальные привилегии |

### Дополнительные товары
- 🪙 1000 игровых монет - 99₽
- 🔨 Набор инструментов - 149₽
- 🛡️ Зачарованная броня - 249₽
- 🏠 Готовый дом - 199₽

## 📱 Мобильная оптимизация

### Адаптивный дизайн
- Breakpoints для всех размеров экранов
- Touch-friendly интерфейс
- Оптимизация для iOS и Android

### PWA функции
```javascript
// Установка как приложение
window.addEventListener('beforeinstallprompt', (e) => {
    // Показ кнопки установки
});

// Офлайн поддержка
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

### Мобильная корзина
- Фиксированная корзина внизу экрана
- Быстрый доступ к покупке
- Свайп-жесты

## 🔐 Безопасность платежей

### Валидация данных
```javascript
function validateNickname(nickname) {
    const nicknameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return nicknameRegex.test(nickname);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

### Защита от дублирования
- Проверка повторных транзакций
- Временные блокировки
- Уникальные ID платежей

## 📊 Аналитика и уведомления

### Google Analytics / Yandex Metrica
```javascript
function trackEvent(eventName, parameters) {
    gtag('event', eventName, parameters);
    ym(123456789, 'reachGoal', eventName);
}
```

### Discord уведомления
```javascript
const embed = {
    title: '💰 Новая покупка!',
    description: `Игрок **${nickname}** купил **${packageName}**`,
    color: 0x00ff00,
    fields: [
        { name: 'Сумма', value: `${price}₽`, inline: true },
        { name: 'Способ оплаты', value: paymentMethod, inline: true }
    ]
};
```

## 🚀 Развертывание

### Production чеклист
- [ ] Настроены SSL сертификаты
- [ ] Обновлены все API ключи на production
- [ ] Настроен мониторинг и логирование
- [ ] Проведено тестирование всех платежных методов
- [ ] Настроены резервные копии базы данных
- [ ] Настроены уведомления об ошибках

### Docker развертывание
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🔧 API документация

### Создание платежа
```http
POST /api/donations/create-payment
Content-Type: application/json

{
    "package": "VIP",
    "nickname": "PlayerName",
    "email": "player@example.com",
    "paymentMethod": "stripe"
}
```

### Статус сервера
```http
GET /api/server-status

Response:
{
    "online": true,
    "players": 42,
    "maxPlayers": 100,
    "version": "1.20.4"
}
```

## 🎨 Кастомизация дизайна

### CSS переменные
```css
:root {
    --primary-color: #6c5ce7;
    --secondary-color: #00d2d3;
    --accent-color: #fd79a8;
    --success-color: #00b894;
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Анимации
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

## 🐛 Отладка и логирование

### Frontend логи
```javascript
console.log('🎮 Donation system initialized');
console.error('❌ Payment failed:', error);
```

### Backend логи
```javascript
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'donations.log' })
    ]
});
```

## 📈 Оптимизация производительности

### Lazy loading
```javascript
// Lazy load payment scripts
const loadStripe = () => import('https://js.stripe.com/v3/');
```

### Image optimization
- WebP формат для современных браузеров
- Responsive images с srcset
- Сжатие без потери качества

### Кэширование
- Service Worker для статических ресурсов
- CDN для библиотек
- Browser caching headers

## 🔄 Обновления и миграции

### Version 2.0.0 (Текущая)
- ✅ Полная переработка UI/UX
- ✅ PWA поддержка
- ✅ Множественные платежные системы
- ✅ Мобильная оптимизация
- ✅ Service Worker

### Roadmap
- 🔄 Admin панель для управления
- 🔄 Статистика и аналитика
- 🔄 A/B тестирование
- 🔄 Многоязычность
- 🔄 Telegram Mini App

## 🤝 Поддержка

### Документация
- [API Reference](docs/api.md)
- [Frontend Guide](docs/frontend.md)
- [Deployment Guide](docs/deployment.md)

### Контакты
- 📧 Email: support@17yotk.ru
- 💬 Discord: [discord.gg/17yotk](https://discord.gg/17yotk)
- 📱 Telegram: [@17yotk_support](https://t.me/17yotk_support)

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

---

**Создано с ❤️ для Minecraft сообщества**

![Footer](https://via.placeholder.com/800x100/0f0f23/6c5ce7?text=17yotk+MC+Server+-+Donation+System)