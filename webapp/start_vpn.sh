#!/bin/bash

echo "🚀 Запуск VPN веб-приложения..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Переходим в папку webapp
cd "$(dirname "$0")"

# Копируем PHP файл в Apache директорию  
sudo cp index.php /var/www/html/
sudo chown www-data:www-data /var/www/html/index.php

# Запускаем Apache
sudo service apache2 start

# Проверяем статус
sleep 2
if curl -s http://localhost/index.php > /dev/null 2>&1; then
    clear
    echo "✅ VPN веб-приложение запущено успешно!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Откройте в браузере: http://localhost/index.php"
    echo ""
    echo "📋 Что делать:"
    echo "   1. Откройте браузер"
    echo "   2. Перейдите по ссылке выше"
    echo "   3. Выберите VPN сервер"
    echo "   4. Нажмите CONNECT"
    echo "   5. Для отключения нажмите DISCONNECT"
    echo ""
    echo "🎯 Доступные серверы:"
    echo "   🇺🇸 США (Нью-Йорк) - 23ms"
    echo "   🇺🇸 США (Лос-Анджелес) - 31ms"
    echo "   🇬🇧 Великобритания (Лондон) - 89ms"
    echo "   🇩🇪 Германия (Франкфурт) - 76ms"
    echo "   🇯🇵 Япония (Токио) - 145ms"
    echo "   🇦🇺 Австралия (Сидней) - 189ms"
    echo "   🇨🇦 Канада (Торонто) - 38ms"
    echo "   🇸🇬 Сингапур - 167ms"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✨ Приложение готово к использованию!"
else
    echo "❌ Ошибка запуска сервера"
    echo "Попробуйте запустить вручную: sudo service apache2 restart"
fi