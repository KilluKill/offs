/**
 * Основной JavaScript файл для 17yotk SITE
 * Содержит функциональность для доната, модальных окон и интерактивности
 */

// Конфигурация для платежных систем (заполняется администратором)
const paymentConfig = {
    card: {
        title: 'Донат картой',
        description: 'Поддержите нас переводом на карту',
        details: [
            'Номер карты: 0000 0000 0000 0000',
            'Получатель: Имя Фамилия',
            'Банк: Название банка',
            'Комментарий: Поддержка проекта 17yotk'
        ],
        qr: null // Можно добавить QR код для карты
    },
    crypto: {
        title: 'Донат криптовалютой',
        description: 'Поддержите нас криптовалютой',
        details: [
            'Bitcoin (BTC): bitcoin_address_here',
            'Ethereum (ETH): ethereum_address_here',
            'USDT (TRC20): usdt_address_here',
            'Минимальная сумма: $5'
        ],
        qr: null // Можно добавить QR коды для крипто-адресов
    },
    qr: {
        title: 'QR код для доната',
        description: 'Отсканируйте QR код для перевода',
        details: [
            'Отсканируйте QR код любым банковским приложением',
            'Укажите в комментарии: Донат 17yotk',
            'Спасибо за поддержку!'
        ],
        qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzMiPkdSINCa0L7QtDwvdGV4dD4KICA8dGV4dCB4PSIxMDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij7QkNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgDwvdGV4dD4KPC9zdmc+'
    }
};

// Класс для управления модальными окнами
class ModalManager {
    constructor() {
        this.modal = document.getElementById('donationModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalBody = document.getElementById('modalBody');
        this.closeBtn = document.querySelector('.close');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Закрытие модального окна
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        
        // Закрытие по клику вне модального окна
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Закрытие по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    openModal(paymentMethod) {
        const config = paymentConfig[paymentMethod];
        if (!config) return;
        
        this.modalTitle.textContent = config.title;
        this.modalBody.innerHTML = this.generateModalContent(config);
        
        this.modal.style.display = 'block';
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Фокус на модальном окне для доступности
        this.modal.focus();
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.modal.setAttribute('aria-hidden', 'true');
    }
    
    generateModalContent(config) {
        let content = `<p class="modal-description">${config.description}</p>`;
        
        if (config.qr) {
            content += `<div class="qr-container">
                <img src="${config.qr}" alt="QR код для доната" class="qr-code">
            </div>`;
        }
        
        content += '<div class="payment-details">';
        config.details.forEach(detail => {
            content += `<div class="detail-item">${detail}</div>`;
        });
        content += '</div>';
        
        content += `
            <div class="modal-actions">
                <button class="copy-btn" onclick="copyToClipboard('${config.details[0]}')">
                    📋 Копировать реквизиты
                </button>
                <button class="close-btn" onclick="modalManager.closeModal()">
                    Закрыть
                </button>
            </div>
        `;
        
        return content;
    }
}

// Класс для управления донатами
class DonationManager {
    constructor() {
        this.modalManager = new ModalManager();
        this.initDonationButtons();
        this.initStatistics();
    }
    
    initDonationButtons() {
        const donateButtons = document.querySelectorAll('.donate-btn');
        donateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                this.handleDonation(method);
            });
        });
    }
    
    handleDonation(method) {
        // Отправка аналитики (опционально)
        this.trackDonationClick(method);
        
        // Открытие модального окна
        this.modalManager.openModal(method);
    }
    
    trackDonationClick(method) {
        // Здесь можно добавить отправку данных в аналитику
        console.log(`Donation method clicked: ${method}`);
        
        // Пример для Google Analytics (если подключен)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'donation_click', {
                'method': method,
                'event_category': 'engagement'
            });
        }
    }
    
    initStatistics() {
        // Счетчик кликов по донатам (сохраняется в localStorage)
        const stats = JSON.parse(localStorage.getItem('donationStats') || '{}');
        
        // Обновление статистики при клике
        document.querySelectorAll('.donate-btn').forEach(button => {
            button.addEventListener('click', () => {
                const method = button.dataset.method;
                stats[method] = (stats[method] || 0) + 1;
                localStorage.setItem('donationStats', JSON.stringify(stats));
            });
        });
    }
}

// Функции для работы с буфером обмена
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Реквизиты скопированы в буфер обмена!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Реквизиты скопированы!', 'success');
    } catch (err) {
        showNotification('Не удалось скопировать реквизиты', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Система уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'inherit',
        fontSize: '14px',
        zIndex: '3000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Цвета в зависимости от типа
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Удаление через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Класс для улучшения производительности
class PerformanceOptimizer {
    constructor() {
        this.initLazyLoading();
        this.initIntersectionObserver();
        this.optimizeMediaElements();
    }
    
    initLazyLoading() {
        // Ленивая загрузка изображений
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback для браузеров без поддержки IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    initIntersectionObserver() {
        // Оптимизация анимаций WOW.js
        const observerOptions = {
            rootMargin: '50px 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add('animate__animated', 'animate__fadeInUp');
                    observer.unobserve(element);
                }
            });
        }, observerOptions);
        
        // Наблюдение за элементами без анимации
        document.querySelectorAll('.wrapper:not(.wow)').forEach(element => {
            observer.observe(element);
        });
    }
    
    optimizeMediaElements() {
        // Оптимизация видео и аудио элементов
        const mediaElements = document.querySelectorAll('video, audio');
        
        mediaElements.forEach(media => {
            // Предзагрузка только метаданных
            media.preload = 'metadata';
            
            // Обработка ошибок
            media.addEventListener('error', (e) => {
                console.warn('Media error:', e);
                this.handleMediaError(media);
            });
            
            // Пауза при выходе из области просмотра для видео
            if (media.tagName === 'VIDEO') {
                this.setupVideoIntersectionObserver(media);
            }
        });
    }
    
    setupVideoIntersectionObserver(video) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (video.paused) {
                        video.play().catch(e => console.log('Video play error:', e));
                    }
                } else {
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
        }, { threshold: 0.5 });
        
        videoObserver.observe(video);
    }
    
    handleMediaError(media) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'media-error';
        errorDiv.textContent = `Ошибка загрузки ${media.tagName.toLowerCase()}`;
        
        media.style.display = 'none';
        media.parentNode.appendChild(errorDiv);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех систем
    const donationManager = new DonationManager();
    const performanceOptimizer = new PerformanceOptimizer();
    
    // Глобальная переменная для модального менеджера
    window.modalManager = donationManager.modalManager;
    
    // Плавная прокрутка для навигационных ссылок
    initSmoothScrolling();
    
    // Инициализация темной темы
    initThemeToggle();
    
    console.log('17yotk SITE loaded successfully!');
});

// Плавная прокрутка
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Учет высоты навигации
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Переключение темы (опционально)
function initThemeToggle() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Реакция на изменение системной темы
    prefersDark.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.matches);
    });
    
    // Инициальная установка темы
    if (prefersDark.matches) {
        document.body.classList.add('dark-theme');
    }
}

// Экспорт функций для глобального доступа
window.copyToClipboard = copyToClipboard;
window.showNotification = showNotification;