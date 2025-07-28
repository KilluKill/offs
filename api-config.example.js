/**
 * Backend API Configuration Example
 * Copy this file to api-config.js and fill in your actual credentials
 * 
 * IMPORTANT: Never commit api-config.js to version control!
 * Add api-config.js to your .gitignore file
 */

const API_CONFIG = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        corsOrigins: [
            'https://17yotk.ru',
            'https://www.17yotk.ru',
            'http://localhost:3000'
        ],
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // Database Configuration
    database: {
        // MongoDB
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/17yotk_donations',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        
        // MySQL (alternative)
        mysql: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || '17yotk_donations',
            charset: 'utf8mb4'
        }
    },

    // Payment Processors
    payments: {
        // Stripe Configuration
        stripe: {
            publicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_your_stripe_public_key',
            secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
            currency: 'rub',
            enabled: true
        },

        // PayPal Configuration
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_client_secret',
            environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
            currency: 'RUB',
            enabled: true
        },

        // Robokassa (Popular in Russia)
        robokassa: {
            merchantLogin: process.env.ROBOKASSA_LOGIN || 'your_merchant_login',
            password1: process.env.ROBOKASSA_PASSWORD1 || 'your_password1',
            password2: process.env.ROBOKASSA_PASSWORD2 || 'your_password2',
            testMode: process.env.NODE_ENV !== 'production',
            enabled: true
        },

        // YooMoney (Yandex.Money)
        yoomoney: {
            shopId: process.env.YOOMONEY_SHOP_ID || 'your_shop_id',
            secretKey: process.env.YOOMONEY_SECRET_KEY || 'your_secret_key',
            enabled: true
        },

        // QIWI
        qiwi: {
            publicKey: process.env.QIWI_PUBLIC_KEY || 'your_qiwi_public_key',
            secretKey: process.env.QIWI_SECRET_KEY || 'your_qiwi_secret_key',
            enabled: true
        },

        // Cryptocurrency (CoinPayments)
        crypto: {
            merchantId: process.env.COINPAYMENTS_MERCHANT_ID || 'your_merchant_id',
            publicKey: process.env.COINPAYMENTS_PUBLIC_KEY || 'your_public_key',
            privateKey: process.env.COINPAYMENTS_PRIVATE_KEY || 'your_private_key',
            ipnSecret: process.env.COINPAYMENTS_IPN_SECRET || 'your_ipn_secret',
            enabled: true
        },

        // Fast Payment System (SBP)
        sbp: {
            bankId: process.env.SBP_BANK_ID || 'your_bank_id',
            merchantId: process.env.SBP_MERCHANT_ID || 'your_merchant_id',
            apiKey: process.env.SBP_API_KEY || 'your_api_key',
            enabled: true
        }
    },

    // Minecraft Server Integration
    minecraft: {
        // Server connection
        server: {
            host: process.env.MC_HOST || '199.83.103.226',
            port: process.env.MC_PORT || 25663,
            rconPort: process.env.MC_RCON_PORT || 25575,
            rconPassword: process.env.MC_RCON_PASSWORD || 'your_rcon_password'
        },

        // Database for permissions (LuckPerms, GroupManager, etc.)
        permissions: {
            type: 'luckperms', // 'luckperms', 'groupmanager', 'permissionsex'
            database: {
                host: process.env.MC_DB_HOST || 'localhost',
                port: process.env.MC_DB_PORT || 3306,
                user: process.env.MC_DB_USER || 'minecraft',
                password: process.env.MC_DB_PASSWORD || '',
                database: process.env.MC_DB_NAME || 'luckperms'
            }
        },

        // Commands to execute for each package
        commands: {
            VIP: [
                'lp user {player} parent set vip',
                'give {player} diamond 5',
                'eco give {player} 1000'
            ],
            PREMIUM: [
                'lp user {player} parent set premium',
                'give {player} diamond_block 3',
                'eco give {player} 2500'
            ],
            ELITE: [
                'lp user {player} parent set elite',
                'give {player} netherite_ingot 2',
                'eco give {player} 5000'
            ],
            LEGEND: [
                'lp user {player} parent set legend',
                'give {player} nether_star 1',
                'eco give {player} 10000'
            ],
            'Монеты 1000': [
                'eco give {player} 1000'
            ],
            'Набор инструментов': [
                'give {player} diamond_pickaxe{Enchantments:[{id:"efficiency",lvl:5},{id:"unbreaking",lvl:3}]} 1',
                'give {player} diamond_axe{Enchantments:[{id:"efficiency",lvl:5},{id:"unbreaking",lvl:3}]} 1',
                'give {player} diamond_shovel{Enchantments:[{id:"efficiency",lvl:5},{id:"unbreaking",lvl:3}]} 1'
            ]
        }
    },

    // Notifications
    notifications: {
        // Discord Webhook
        discord: {
            webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your_webhook_url',
            enabled: true,
            channels: {
                donations: process.env.DISCORD_DONATIONS_WEBHOOK || '',
                errors: process.env.DISCORD_ERRORS_WEBHOOK || ''
            }
        },

        // Telegram Bot
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN || 'your_bot_token',
            chatId: process.env.TELEGRAM_CHAT_ID || 'your_chat_id',
            enabled: true
        },

        // Email notifications
        email: {
            service: 'gmail', // or 'mailgun', 'sendgrid'
            auth: {
                user: process.env.EMAIL_USER || 'your_email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your_app_password'
            },
            from: process.env.EMAIL_FROM || 'noreply@17yotk.ru',
            enabled: true
        }
    },

    // Security
    security: {
        // JWT for API authentication
        jwt: {
            secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this',
            expiresIn: '24h'
        },

        // API Keys for internal services
        apiKeys: {
            minecraft: process.env.MC_API_KEY || 'your_minecraft_api_key',
            admin: process.env.ADMIN_API_KEY || 'your_admin_api_key'
        },

        // Encryption for sensitive data
        encryption: {
            algorithm: 'aes-256-gcm',
            key: process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key'
        }
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: {
            enabled: true,
            path: './logs/donation-system.log',
            maxSize: '10m',
            maxFiles: '5'
        },
        database: {
            enabled: true,
            collection: 'logs'
        }
    },

    // Features
    features: {
        // Auto-refund failed transactions
        autoRefund: {
            enabled: true,
            timeoutMinutes: 30
        },

        // Duplicate transaction prevention
        duplicateDetection: {
            enabled: true,
            windowMinutes: 5
        },

        // Analytics
        analytics: {
            enabled: true,
            googleAnalytics: process.env.GA_TRACKING_ID || '',
            yandexMetrica: process.env.YM_COUNTER_ID || ''
        }
    }
};

// Package configurations
const PACKAGES = {
    VIP: {
        id: 'vip',
        name: 'VIP',
        price: 199,
        currency: 'RUB',
        description: 'Базовые VIP привилегии',
        duration: 'permanent', // or days: 30
        features: [
            'Префикс [VIP] в чате',
            'Цветной ник в игре',
            '5 дополнительных домов',
            'Команда /fly на 30 минут',
            'Доступ к VIP региону',
            'VIP кит раз в день'
        ]
    },
    PREMIUM: {
        id: 'premium',
        name: 'PREMIUM',
        price: 399,
        currency: 'RUB',
        description: 'Расширенные привилегии',
        duration: 'permanent',
        features: [
            'Все привилегии VIP',
            'Префикс [PREMIUM]',
            '15 дополнительных домов',
            'Команда /fly на 1 час',
            'Кит с алмазной броней',
            'Приоритет входа на сервер',
            'Доступ к /heal и /feed'
        ]
    },
    ELITE: {
        id: 'elite',
        name: 'ELITE',
        price: 699,
        currency: 'RUB',
        description: 'Продвинутые привилегии',
        duration: 'permanent',
        features: [
            'Все привилегии PREMIUM',
            'Префикс [ELITE]',
            'Безлимитные дома',
            'Постоянный /fly',
            'Кит с незеритовой броней',
            'Личный регион 100x100',
            'Команды творчества'
        ]
    },
    LEGEND: {
        id: 'legend',
        name: 'LEGEND',
        price: 999,
        currency: 'RUB',
        description: 'Максимальные привилегии',
        duration: 'permanent',
        features: [
            'Все привилегии ELITE',
            'Префикс [LEGEND]',
            'Уникальные эффекты частиц',
            'Доступ к админ командам',
            'Личный регион 200x200',
            'Особый чат канал',
            'Создание варпов'
        ]
    }
};

// Export configuration
module.exports = {
    API_CONFIG,
    PACKAGES
};

// Environment validation
function validateEnvironment() {
    const required = [
        'STRIPE_SECRET_KEY',
        'PAYPAL_CLIENT_SECRET',
        'MONGODB_URI',
        'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.warn('⚠️  Missing environment variables:', missing.join(', '));
        console.warn('Please set these variables in your .env file or environment');
    }
}

// Call validation in development
if (process.env.NODE_ENV !== 'production') {
    validateEnvironment();
}