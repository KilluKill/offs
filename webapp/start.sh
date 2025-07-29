#!/bin/bash

# SecureVPN Web Application Startup Script

echo "🚀 Запуск SecureVPN Web Application..."

# Переходим в директорию webapp
cd "$(dirname "$0")"

# Активируем виртуальное окружение
if [ -d "venv" ]; then
    echo "📦 Активация виртуального окружения..."
    source venv/bin/activate
else
    echo "❌ Виртуальное окружение не найдено!"
    echo "Выполните: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Проверяем зависимости
echo "🔍 Проверка зависимостей..."
if ! python -c "import flask, flask_cors, requests" 2>/dev/null; then
    echo "📥 Установка зависимостей..."
    pip install -r requirements.txt
fi

# Останавливаем предыдущие процессы
echo "🛑 Остановка предыдущих процессов..."
pkill -f "python backend/app.py" 2>/dev/null || true

# Запускаем сервер
echo "🌐 Запуск VPN веб-сервера..."
echo "📍 Сервер будет доступен по адресу: http://localhost:5000"
echo "📊 Логи сервера записываются в server.log"
echo "⏹️  Для остановки используйте: pkill -f 'python backend/app.py'"

# Запускаем в фоновом режиме
nohup python backend/app.py > server.log 2>&1 &

# Ждем запуска
sleep 3

# Проверяем статус
if curl -s http://localhost:5000/api/status > /dev/null; then
    echo "✅ Сервер успешно запущен!"
    echo "🔗 Откройте в браузере: http://localhost:5000"
    echo ""
    echo "🎯 Доступные функции:"
    echo "   • Выбор VPN серверов из 5 локаций"
    echo "   • Подключение/отключение одним кликом"
    echo "   • Мониторинг статистики в реальном времени"
    echo "   • Современный адаптивный интерфейс"
    echo ""
    echo "📋 API эндпоинты:"
    echo "   • GET  /api/status  - статус подключения"
    echo "   • GET  /api/servers - список серверов"
    echo "   • POST /api/connect - подключение к VPN"
    echo "   • POST /api/disconnect - отключение от VPN"
    echo "   • GET  /api/stats   - статистика использования"
else
    echo "❌ Ошибка запуска сервера!"
    echo "📋 Проверьте логи: cat server.log"
fi