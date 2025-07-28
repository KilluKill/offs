// Global variables
let selectedPackageName = '';
let selectedPackagePrice = 0;

// DOM Elements
const purchaseForm = document.getElementById('purchaseForm');
const selectedPackageDiv = document.getElementById('selectedPackage');
const donateForm = document.getElementById('donateForm');

// Package selection function
function selectPackage(packageName, price) {
    selectedPackageName = packageName;
    selectedPackagePrice = price;
    
    // Show purchase form
    purchaseForm.style.display = 'block';
    
    // Update selected package display
    selectedPackageDiv.innerHTML = `
        <h4>Выбранный пакет:</h4>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <span style="font-size: 1.2rem; font-weight: bold;">${packageName}</span>
            <span style="font-size: 1.5rem; color: #64ffda;">${price}₽</span>
        </div>
    `;
    
    // Smooth scroll to form
    purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add animation effect
    purchaseForm.style.transform = 'scale(0.95)';
    setTimeout(() => {
        purchaseForm.style.transform = 'scale(1)';
    }, 100);
}

// Form submission handler
donateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(donateForm);
    const nickname = formData.get('nickname');
    const email = formData.get('email');
    const paymentMethod = formData.get('paymentMethod');
    
    // Validate form
    if (!nickname || !email || !paymentMethod) {
        showNotification('Пожалуйста, заполните все поля!', 'error');
        return;
    }
    
    // Simulate payment processing
    showNotification('Перенаправляем на страницу оплаты...', 'info');
    
    setTimeout(() => {
        processPayment(nickname, email, paymentMethod);
    }, 2000);
});

// Payment processing simulation
function processPayment(nickname, email, paymentMethod) {
    const paymentData = {
        package: selectedPackageName,
        price: selectedPackagePrice,
        nickname: nickname,
        email: email,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString()
    };
    
    // In a real application, this would send data to your payment processor
    console.log('Payment data:', paymentData);
    
    // Simulate successful payment
    showNotification(`Оплата прошла успешно! Привилегии "${selectedPackageName}" будут выданы игроку ${nickname} в течение 5 минут.`, 'success');
    
    // Reset form
    donateForm.reset();
    purchaseForm.style.display = 'none';
    selectedPackageName = '';
    selectedPackagePrice = 0;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        max-width: 400px;
        transform: translateX(500px);
        transition: transform 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        opacity: 0.7;
        transition: opacity 0.3s ease;
        margin-left: auto;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'rgba(76, 175, 80, 0.9)';
        case 'error': return 'rgba(244, 67, 54, 0.9)';
        case 'warning': return 'rgba(255, 152, 0, 0.9)';
        default: return 'rgba(33, 150, 243, 0.9)';
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.package-card, .item-card, .payment-method');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                entry.target.style.opacity = '1';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Copy server IP to clipboard
function copyServerIP() {
    const serverIP = 'mc.17yotk.ru';
    navigator.clipboard.writeText(serverIP).then(() => {
        showNotification('IP адрес сервера скопирован в буфер обмена!', 'success');
    }).catch(() => {
        showNotification('Не удалось скопировать IP адрес', 'error');
    });
}

// Particle effect for buttons
function createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const particles = [];
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #64ffda;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / 10) * Math.PI * 2;
        const velocity = 3 + Math.random() * 2;
        const life = 1000;
        
        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2;
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        let opacity = 1;
        
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / life;
            
            if (progress >= 1) {
                particle.remove();
                return;
            }
            
            x += vx;
            y += vy;
            vy += 0.1; // gravity
            opacity = 1 - progress;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
}

// Add particle effects to buy buttons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    animateOnScroll();
    
    // Add click effects to buy buttons
    document.querySelectorAll('.buy-button, .cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            createParticleEffect(this);
        });
    });
    
    // Add server IP copy functionality
    const serverIPElements = document.querySelectorAll('[data-server-ip]');
    serverIPElements.forEach(element => {
        element.style.cursor = 'pointer';
        element.addEventListener('click', copyServerIP);
    });
    
    // Welcome message
    setTimeout(() => {
        showNotification('Добро пожаловать в донат магазин 17yotk MC Server! 🎮', 'info');
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close purchase form
    if (e.key === 'Escape' && purchaseForm.style.display === 'block') {
        purchaseForm.style.display = 'none';
        selectedPackageName = '';
        selectedPackagePrice = 0;
    }
});

// Add loading spinner
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.innerHTML = `
        <div class="spinner-overlay">
            <div class="spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p>Обработка платежа...</p>
            </div>
        </div>
    `;
    
    spinner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 15000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    spinner.querySelector('.spinner').style.cssText = `
        text-align: center;
        color: white;
    `;
    
    spinner.querySelector('.spinner i').style.cssText = `
        font-size: 3rem;
        color: #64ffda;
        margin-bottom: 1rem;
        display: block;
    `;
    
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}