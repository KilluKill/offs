#!/bin/bash

echo "🚀 Запуск VPN сайта..."

# Остановить предыдущие процессы
pkill -f "php -S" 2>/dev/null

# Перейти в папку webapp
cd "$(dirname "$0")"

# Запустить PHP сервер в фоне
nohup php -S localhost:8000 index.php > server.log 2>&1 &

# Подождать запуска
sleep 3

# Проверить работу
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    clear
    echo "✅ VPN сайт запущен успешно!"
    echo ""
    echo "🌐 Откройте в браузере: http://localhost:8000"
    echo ""
    echo "📋 Инструкция:"
    echo "   1. Откройте браузер"
    echo "   2. Перейдите: http://localhost:8000"
    echo "   3. Выберите VPN сервер"
    echo "   4. Нажмите CONNECT"
    echo "   5. Готово!"
    echo ""
    echo "🎯 Если стили не загружаются:"
    echo "   - Обновите страницу (F5)"
    echo "   - Очистите кэш браузера"
    echo "   - Попробуйте другой браузер"
    echo ""
    echo "✨ Сайт работает на http://localhost:8000"
else
    echo "❌ Ошибка запуска"
    echo "Проверьте логи в файле server.log"
fi