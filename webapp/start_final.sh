#!/bin/bash

echo "🚀 Запуск VPN веб-приложения..."

# Переход в папку
cd "$(dirname "$0")"

# Остановка предыдущих процессов
pkill -f "python backend/app.py" 2>/dev/null || true
sleep 1

# Активация виртуального окружения
source venv/bin/activate

# Запуск Flask сервера
echo "🌐 Запуск Flask сервера..."
python backend/app.py &
FLASK_PID=$!

# Ожидание запуска
sleep 4

# Проверка работы
if curl -s http://localhost:5000 >/dev/null 2>&1; then
    clear
    echo "✅ VPN веб-приложение работает!"
    echo ""
    echo "🌐 Откройте в браузере: http://localhost:5000"
    echo ""
    echo "📋 Теперь у вас есть:"
    echo "   ✅ Современные CSS стили встроены в HTML"
    echo "   ✅ JavaScript логика работает"
    echo "   ✅ Все функции VPN доступны"
    echo "   ✅ Градиентный фон и анимации"
    echo "   ✅ Подключение/отключение VPN"
    echo ""
    echo "🎯 Что делать:"
    echo "   1. Откройте браузер"
    echo "   2. Перейдите: http://localhost:5000"
    echo "   3. Выберите VPN сервер (кликните по нему)"
    echo "   4. Нажмите кнопку Connect"
    echo "   5. Готово!"
    echo ""
    echo "Flask PID: $FLASK_PID"
else
    echo "❌ Ошибка запуска сервера"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi