#!/bin/bash

# Автоматический запуск VPN веб-приложения
# Просто запустите этот файл и все будет готово!

clear
echo "🚀 SecureVPN - Автоматический запуск..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Переходим в директорию скрипта
cd "$(dirname "$0")"

# Останавливаем предыдущие процессы
pkill -f "python backend/app.py" 2>/dev/null || true

# Активируем виртуальное окружение и запускаем сервер
source venv/bin/activate
nohup python backend/app.py > /dev/null 2>&1 &

# Ждем запуска сервера
echo "⏳ Запуск сервера..."
sleep 4

# Проверяем, что сервер работает
if curl -s http://localhost:5000/api/status > /dev/null 2>&1; then
    clear
    echo "✅ VPN веб-приложение готово к использованию!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Откройте в браузере: http://localhost:5000"
    echo ""
    echo "🎯 Что вы можете делать:"
    echo "   • Выберите VPN сервер из списка"
    echo "   • Нажмите кнопку 'Connect' для подключения"
    echo "   • Нажмите 'Disconnect' для отключения"
    echo "   • Смотрите статистику в реальном времени"
    echo ""
    echo "🔧 Доступные серверы:"
    echo "   • 🇺🇸 US East (New York)"
    echo "   • 🇺🇸 US West (Los Angeles)" 
    echo "   • 🇬🇧 Europe (London)"
    echo "   • 🇯🇵 Asia (Tokyo)"
    echo "   • 🇨🇦 Canada (Toronto)"
    echo ""
    echo "⚠️  Для остановки сервера закройте этот терминал"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Пытаемся автоматически открыть браузер
    if command -v xdg-open > /dev/null 2>&1; then
        echo "🔍 Пытаюсь открыть браузер автоматически..."
        xdg-open http://localhost:5000 2>/dev/null &
    elif command -v open > /dev/null 2>&1; then
        echo "🔍 Пытаюсь открыть браузер автоматически..."
        open http://localhost:5000 2>/dev/null &
    fi
    
    # Держим сервер запущенным
    wait
else
    echo "❌ Ошибка запуска сервера!"
    echo "Проверьте, что все файлы на месте и попробуйте снова."
fi