/**
 * 17yotk MC Server - Modern Donation System
 * Advanced payment processing with multiple gateways
 */

// Configuration
// ВАЖНО: Замените тестовые ключи на реальные перед продакшеном!
const CONFIG = {
    SERVER_IP: 'mc.17yotk.ru',
    API_ENDPOINT: '/api/donations',
    STRIPE_PUBLIC_KEY: 'pk_test_your_stripe_key_here', // Замените на реальный ключ Stripe
    PAYPAL_CLIENT_ID: 'YOUR_PAYPAL_CLIENT_ID', // Замените на реальный Client ID PayPal
    WEBSOCKET_URL: 'wss://17yotk.ru/ws',
    
    // Animation settings
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 100,
    
    // Server status
    STATUS_CHECK_INTERVAL: 30000,
    
    // PWA settings
    SW_PATH: '/sw.js'
};

// Global state
const state = {
    selectedPackage: null,
    selectedPaymentMethod: null,
    isFormVisible: false,
    isProcessing: false,
    serverOnline: true,
    playerCount: 0,
    notifications: [],
    animations: {
        counters: false,
        packages: false
    }
};

// Payment processors
const paymentProcessors = {
    stripe: null,
    paypal: null
};

// DOM Elements
const elements = {
    // Forms
    purchaseForm: null,
    donateForm: null,
    selectedPackageDiv: null,
    
    // Navigation
    mobileMenuToggle: null,
    nav: null,
    header: null,
    
    // Status
    serverStatus: null,
    playerCount: null,
    footerPlayerCount: null,
    
    // Mobile cart
    mobileCart: null,
    cartItemName: null,
    cartItemPrice: null,
    
    // Loading
    loadingScreen: null
};

/**
 * Initialize the application
 */
async function init() {
    try {
        // Cache DOM elements
        cacheDOMElements();
        
        // Initialize core features
        await initializeComponents();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start background tasks
        startBackgroundTasks();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('🎮 Donation system initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showNotification('Ошибка инициализации системы', 'error');
    }
}

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
    elements.purchaseForm = document.getElementById('purchaseForm');
    elements.donateForm = document.getElementById('donateForm');
    elements.selectedPackageDiv = document.getElementById('selectedPackage');
    elements.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    elements.nav = document.getElementById('nav');
    elements.header = document.getElementById('header');
    elements.serverStatus = document.getElementById('serverStatus');
    elements.playerCount = document.getElementById('playerCount');
    elements.footerPlayerCount = document.getElementById('footerPlayerCount');
    elements.mobileCart = document.getElementById('mobileCart');
    elements.cartItemName = document.querySelector('.cart-item-name');
    elements.cartItemPrice = document.querySelector('.cart-item-price');
    elements.loadingScreen = document.getElementById('loadingScreen');
}

/**
 * Initialize all components
 */
async function initializeComponents() {
    // Initialize payment processors
    await initializePaymentProcessors();
    
    // Setup animations
    initializeAnimations();
    
    // Setup PWA
    initializePWA();
    
    // Initialize server status
    updateServerStatus();
    
    // Initialize notifications system
    initializeNotifications();
    
    // Setup form validation
    initializeFormValidation();
}

/**
 * Initialize payment processors
 */
async function initializePaymentProcessors() {
    try {
        // Initialize Stripe
        if (window.Stripe && CONFIG.STRIPE_PUBLIC_KEY) {
            paymentProcessors.stripe = Stripe(CONFIG.STRIPE_PUBLIC_KEY);
            console.log('✅ Stripe initialized');
        }
        
        // PayPal is loaded via script tag in HTML
        if (window.paypal) {
            console.log('✅ PayPal SDK loaded');
        }
        
    } catch (error) {
        console.error('❌ Payment processor initialization failed:', error);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Mobile menu toggle
    if (elements.mobileMenuToggle && elements.nav) {
        elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Form submission
    if (elements.donateForm) {
        elements.donateForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Scroll animations
    setupScrollAnimations();
    
    // Window events
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // PWA installation
    window.addEventListener('beforeinstallprompt', handlePWAInstall);
    
    // Visibility change for background tasks
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Package selection handler
 */
function selectPackage(name, price, type) {
    console.log('🎮 Selecting package:', { name, price, type });
    
    try {
        state.selectedPackage = { name, price, type };
        console.log('✅ Package selected:', state.selectedPackage);
        
        // Update selected package display
        updateSelectedPackageDisplay();
        
        // Show purchase form
        showPurchaseForm();
        
        // Update mobile cart
        updateMobileCart();
        
        // Analytics
        trackEvent('package_selected', { package: name, price });
        
        // Particle effect
        createSelectionEffect();
        
        showNotification(`Выбран пакет: ${name}`, 'success');
        
    } catch (error) {
        console.error('❌ Error selecting package:', error);
        showNotification('Ошибка выбора пакета: ' + error.message, 'error');
    }
}

/**
 * Update selected package display
 */
function updateSelectedPackageDisplay() {
    if (!elements.selectedPackageDiv || !state.selectedPackage) return;
    
    const { name, price, type } = state.selectedPackage;
    
    elements.selectedPackageDiv.innerHTML = `
        <div class="selected-package-header">
            <h4><i class="fas fa-shopping-bag"></i> Выбранный товар</h4>
        </div>
        <div class="selected-package-details">
            <div class="package-info">
                <div class="package-name">${name}</div>
                <div class="package-type">${getPackageTypeLabel(type)}</div>
            </div>
            <div class="package-price">
                <span class="price-amount">${price}</span>
                <span class="price-currency">₽</span>
            </div>
        </div>
        <div class="package-benefits">
            <small><i class="fas fa-clock"></i> Мгновенная активация</small>
            <small><i class="fas fa-shield-alt"></i> Защищенный платеж</small>
        </div>
    `;
}

/**
 * Get package type label
 */
function getPackageTypeLabel(type) {
    const labels = {
        vip: 'Привилегии',
        premium: 'Привилегии',
        elite: 'Привилегии',
        legend: 'Привилегии',
        coins: 'Игровая валюта',
        tools: 'Игровые предметы',
        armor: 'Игровые предметы',
        house: 'Строения',
        pets: 'Питомцы',
        resources: 'Ресурсы'
    };
    return labels[type] || 'Товар';
}

/**
 * Show purchase form
 */
function showPurchaseForm() {
    if (!elements.purchaseForm) return;
    
    elements.purchaseForm.classList.add('active');
    state.isFormVisible = true;
    
    // Smooth scroll to form
    setTimeout(() => {
        elements.purchaseForm.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
    
    // Focus on first input
    const firstInput = elements.purchaseForm.querySelector('input[type="text"]');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

/**
 * Close purchase form
 */
function closePurchaseForm() {
    if (!elements.purchaseForm) return;
    
    elements.purchaseForm.classList.remove('active');
    state.isFormVisible = false;
    state.selectedPackage = null;
    
    // Hide mobile cart
    hideMobileCart();
    
    // Reset form
    if (elements.donateForm) {
        elements.donateForm.reset();
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (state.isProcessing) return;
    
    try {
        state.isProcessing = true;
        
        // Validate form
        const formData = validateForm();
        if (!formData) return;
        
        // Show loading
        showLoadingSpinner();
        
        // Process payment
        await processPayment(formData);
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Ошибка обработки формы', 'error');
    } finally {
        state.isProcessing = false;
        hideLoadingSpinner();
    }
}

/**
 * Validate form data
 */
function validateForm() {
    const formData = new FormData(elements.donateForm);
    const data = {
        nickname: formData.get('nickname')?.trim(),
        email: formData.get('email')?.trim(),
        paymentMethod: formData.get('paymentMethod'),
        agreement: formData.get('agreement'),
        newsletter: formData.get('newsletter')
    };
    
    // Validate required fields
    if (!data.nickname) {
        showNotification('Введите игровой ник', 'error');
        focusField('nickname');
        return null;
    }
    
    if (!validateNickname(data.nickname)) {
        showNotification('Некорректный игровой ник', 'error');
        focusField('nickname');
        return null;
    }
    
    if (!data.email || !validateEmail(data.email)) {
        showNotification('Введите корректный email', 'error');
        focusField('email');
        return null;
    }
    
    if (!data.paymentMethod) {
        showNotification('Выберите способ оплаты', 'error');
        return null;
    }
    
    if (!data.agreement) {
        showNotification('Необходимо согласиться с условиями', 'error');
        return null;
    }
    
    return { ...data, package: state.selectedPackage };
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Minecraft nickname
 */
function validateNickname(nickname) {
    const nicknameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return nicknameRegex.test(nickname);
}

/**
 * Focus on form field
 */
function focusField(fieldName) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Process payment based on selected method
 */
async function processPayment(formData) {
    const { paymentMethod } = formData;
    
    try {
        switch (paymentMethod) {
            case 'card':
                await processStripePayment(formData);
                break;
            case 'paypal':
                await processPayPalPayment(formData);
                break;
            case 'sbp':
                await processSBPPayment(formData);
                break;
            case 'crypto':
                await processCryptoPayment(formData);
                break;
            default:
                throw new Error(`Unsupported payment method: ${paymentMethod}`);
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
    }
}

/**
 * Process Stripe payment
 */
async function processStripePayment(formData) {
    if (!paymentProcessors.stripe) {
        throw new Error('Stripe not initialized');
    }
    
    try {
        // Create payment intent
        const response = await fetch(`${CONFIG.API_ENDPOINT}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: state.selectedPackage.price * 100, // Convert to kopecks
                currency: 'rub',
                metadata: {
                    nickname: formData.nickname,
                    email: formData.email,
                    package: state.selectedPackage.name
                }
            })
        });
        
        const { client_secret } = await response.json();
        
        // Confirm payment
        const { error } = await paymentProcessors.stripe.confirmCardPayment(client_secret, {
            payment_method: {
                card: {
                    // Card details would be collected via Stripe Elements
                },
                billing_details: {
                    email: formData.email,
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        await handleSuccessfulPayment(formData);
        
    } catch (error) {
        throw new Error(`Stripe payment failed: ${error.message}`);
    }
}

/**
 * Process PayPal payment
 */
async function processPayPalPayment(formData) {
    if (!window.paypal) {
        throw new Error('PayPal SDK not loaded');
    }
    
    return new Promise((resolve, reject) => {
        window.paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: state.selectedPackage.price.toString(),
                            currency_code: 'RUB'
                        },
                        description: `${state.selectedPackage.name} - ${formData.nickname}`
                    }]
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();
                    await handleSuccessfulPayment(formData, order);
                    resolve(order);
                } catch (error) {
                    reject(error);
                }
            },
            onError: (error) => {
                reject(new Error(`PayPal payment failed: ${error.message || 'Unknown error'}`));
            }
        }).render('#paypal-button-container');
    });
}

/**
 * Process SBP (Fast Payment System) payment
 */
async function processSBPPayment(formData) {
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/create-sbp-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: state.selectedPackage.price,
                description: `${state.selectedPackage.name} - ${formData.nickname}`,
                metadata: formData
            })
        });
        
        const { payment_url, payment_id } = await response.json();
        
        // Redirect to SBP payment page
        window.open(payment_url, '_blank');
        
        // Poll for payment status
        await pollPaymentStatus(payment_id);
        
        await handleSuccessfulPayment(formData);
        
    } catch (error) {
        throw new Error(`SBP payment failed: ${error.message}`);
    }
}

/**
 * Process cryptocurrency payment
 */
async function processCryptoPayment(formData) {
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/create-crypto-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: state.selectedPackage.price,
                currency: 'RUB',
                metadata: formData
            })
        });
        
        const { payment_address, amount_crypto, currency_crypto, payment_id } = await response.json();
        
        // Show crypto payment modal
        showCryptoPaymentModal({
            address: payment_address,
            amount: amount_crypto,
            currency: currency_crypto,
            payment_id
        });
        
    } catch (error) {
        throw new Error(`Crypto payment failed: ${error.message}`);
    }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(formData, paymentDetails = null) {
    try {
        // Send confirmation to server
        const response = await fetch(`${CONFIG.API_ENDPOINT}/confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                payment_details: paymentDetails,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showSuccessModal(formData);
            
            // Reset form
            closePurchaseForm();
            
            // Track conversion
            trackEvent('purchase_completed', {
                package: state.selectedPackage.name,
                price: state.selectedPackage.price,
                method: formData.paymentMethod
            });
            
            // Send notification to Discord/Telegram
            notifyAdmins(formData);
            
        } else {
            throw new Error(result.message || 'Payment confirmation failed');
        }
        
    } catch (error) {
        console.error('Payment confirmation error:', error);
        showNotification('Ошибка подтверждения платежа. Обратитесь в поддержку.', 'error');
    }
}

/**
 * Show success modal
 */
function showSuccessModal(formData) {
    const modal = createModal({
        title: '🎉 Платеж успешно обработан!',
        content: `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Спасибо за покупку!</h3>
                <p>Привилегии "${state.selectedPackage.name}" будут выданы игроку <strong>${formData.nickname}</strong> в течение 5 минут.</p>
                <div class="success-details">
                    <div class="detail">
                        <i class="fas fa-user"></i>
                        <span>Игрок: ${formData.nickname}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-envelope"></i>
                        <span>Email: ${formData.email}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-gem"></i>
                        <span>Товар: ${state.selectedPackage.name}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-ruble-sign"></i>
                        <span>Сумма: ${state.selectedPackage.price}₽</span>
                    </div>
                </div>
                <div class="success-actions">
                    <button class="btn btn-primary" onclick="copyServerIP()">
                        <i class="fas fa-server"></i>
                        Скопировать IP сервера
                    </button>
                    <a href="https://discord.gg/17yotk" class="btn btn-secondary" target="_blank">
                        <i class="fab fa-discord"></i>
                        Присоединиться к Discord
                    </a>
                </div>
            </div>
        `,
        showCloseButton: true,
        autoClose: false
    });
    
    // Confetti animation
    createConfettiEffect();
}

/**
 * Mobile menu toggle
 */
function toggleMobileMenu() {
    if (!elements.nav || !elements.mobileMenuToggle) return;
    
    const isActive = elements.nav.classList.contains('active');
    
    if (isActive) {
        elements.nav.classList.remove('active');
        elements.mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        elements.nav.classList.add('active');
        elements.mobileMenuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Copy server IP to clipboard
 */
async function copyServerIP() {
    try {
        await navigator.clipboard.writeText(CONFIG.SERVER_IP);
        showNotification(`IP сервера ${CONFIG.SERVER_IP} скопирован!`, 'success');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = CONFIG.SERVER_IP;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(`IP сервера ${CONFIG.SERVER_IP} скопирован!`, 'success');
    }
}

/**
 * Copy email to clipboard
 */
async function copyEmail(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const email = 'support@17yotk.ru';
    try {
        await navigator.clipboard.writeText(email);
        showNotification(`Email ${email} скопирован!`, 'success');
    } catch (error) {
        console.error('Failed to copy email:', error);
    }
}

/**
 * Toggle FAQ item
 */
function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = button.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-question.active').forEach(q => {
        if (q !== button) {
            q.classList.remove('active');
            q.closest('.faq-item').querySelector('.faq-answer').classList.remove('active');
        }
    });
    
    // Toggle current item
    if (isActive) {
        button.classList.remove('active');
        answer.classList.remove('active');
    } else {
        button.classList.add('active');
        answer.classList.add('active');
    }
}

/**
 * Update mobile cart
 */
function updateMobileCart() {
    if (!elements.mobileCart || !state.selectedPackage) return;
    
    if (elements.cartItemName) {
        elements.cartItemName.textContent = state.selectedPackage.name;
    }
    
    if (elements.cartItemPrice) {
        elements.cartItemPrice.textContent = `${state.selectedPackage.price}₽`;
    }
    
    // Show cart on mobile
    if (window.innerWidth <= 768) {
        elements.mobileCart.classList.add('active');
    }
}

/**
 * Hide mobile cart
 */
function hideMobileCart() {
    if (elements.mobileCart) {
        elements.mobileCart.classList.remove('active');
    }
}

/**
 * Show purchase form from mobile cart
 */
function showPurchaseFormFromCart() {
    if (state.isFormVisible) return;
    if (elements.purchaseForm) {
        elements.purchaseForm.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

/**
 * Notification system
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notification = createNotificationElement(message, type);
    
    // Add to state
    state.notifications.push(notification);
    
    // Add to DOM
    document.body.appendChild(notification.element);
    
    // Animate in
    setTimeout(() => {
        notification.element.classList.add('show');
    }, 100);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
    
    return notification;
}

/**
 * Create notification element
 */
function createNotificationElement(message, type) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const element = document.createElement('div');
    
    element.id = id;
    element.className = `notification notification-${type}`;
    element.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="removeNotificationById('${id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    return { id, element, type, message };
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Remove notification
 */
function removeNotification(notification) {
    if (!notification || !notification.element) return;
    
    notification.element.classList.add('hide');
    
    setTimeout(() => {
        if (notification.element && notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
        
        // Remove from state
        const index = state.notifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
            state.notifications.splice(index, 1);
        }
    }, 300);
}

/**
 * Remove notification by ID (for click handlers)
 */
function removeNotificationById(id) {
    const notification = state.notifications.find(n => n.id === id);
    if (notification) {
        removeNotification(notification);
    }
}

/**
 * Initialize animations
 */
function initializeAnimations() {
    // Animate counters in hero section
    animateCounters();
    
    // Setup intersection observer for scroll animations
    setupIntersectionObserver();
    
    // Add CSS animation classes
    addAnimationClasses();
}

/**
 * Animate hero counters
 */
function animateCounters() {
    if (state.animations.counters) return;
    
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (counter.textContent.includes('%')) {
                counter.textContent = Math.floor(current) + '%';
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
    
    state.animations.counters = true;
}

/**
 * Setup intersection observer for scroll animations
 */
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Animate package cards with delay
                if (entry.target.classList.contains('package-card')) {
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements
    document.querySelectorAll('.package-card, .item-card, .payment-method, .support-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Add animation classes to elements
 */
function addAnimationClasses() {
    // Add stagger animation to package cards
    document.querySelectorAll('.package-card').forEach((card, index) => {
        card.style.setProperty('--animation-delay', `${index * 0.1}s`);
    });
}

/**
 * Setup smooth scrolling
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = elements.header ? elements.header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    let ticking = false;
    
    function updateScrollPosition() {
        const scrolled = window.pageYOffset;
        
        // Update header
        if (elements.header) {
            if (scrolled > 100) {
                elements.header.classList.add('scrolled');
            } else {
                elements.header.classList.remove('scrolled');
            }
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

/**
 * Handle scroll events
 */
function handleScroll() {
    // Throttle scroll events
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        // Trigger counter animation when hero is visible
        if (!state.animations.counters && isElementInViewport(document.querySelector('.hero-stats'))) {
            animateCounters();
        }
    }, 100);
}

/**
 * Handle resize events
 */
function handleResize() {
    // Close mobile menu on resize
    if (window.innerWidth > 768 && elements.nav && elements.nav.classList.contains('active')) {
        toggleMobileMenu();
    }
    
    // Hide mobile cart on desktop
    if (window.innerWidth > 768 && elements.mobileCart) {
        hideMobileCart();
    }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Escape key to close modals and forms
    if (event.key === 'Escape') {
        if (state.isFormVisible) {
            closePurchaseForm();
        }
        
        // Close mobile menu
        if (elements.nav && elements.nav.classList.contains('active')) {
            toggleMobileMenu();
        }
        
        // Close notifications
        state.notifications.forEach(removeNotification);
    }
    
    // Ctrl/Cmd + K to focus search (if implemented)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Focus search field if available
    }
}

/**
 * Initialize PWA features
 */
function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(CONFIG.SW_PATH)
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }
}

/**
 * Handle PWA installation prompt
 */
function handlePWAInstall(event) {
    event.preventDefault();
    
    // Show custom install button
    const installButton = document.createElement('button');
    installButton.className = 'btn btn-secondary pwa-install';
    installButton.innerHTML = '<i class="fas fa-download"></i> Установить приложение';
    installButton.onclick = () => {
        event.prompt();
        event.userChoice.then(result => {
            if (result.outcome === 'accepted') {
                console.log('✅ PWA installed');
                trackEvent('pwa_installed');
            }
            installButton.remove();
        });
    };
    
    // Add to header or hero section
    const container = document.querySelector('.hero-buttons') || elements.header;
    if (container) {
        container.appendChild(installButton);
    }
}

/**
 * Update server status
 */
async function updateServerStatus() {
    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/server-status`);
        const data = await response.json();
        
        state.serverOnline = data.online;
        state.playerCount = data.players || 0;
        
        // Update UI
        updateServerStatusUI();
        
    } catch (error) {
        console.error('Failed to fetch server status:', error);
        state.serverOnline = false;
        updateServerStatusUI();
    }
}

/**
 * Update server status UI
 */
function updateServerStatusUI() {
    // Update status indicator
    if (elements.serverStatus) {
        elements.serverStatus.style.backgroundColor = state.serverOnline ? 
            'var(--success-color)' : 'var(--error-color)';
    }
    
    // Update player count
    const playerCountText = state.serverOnline ? 
        state.playerCount.toString() : '0';
    
    if (elements.playerCount) {
        elements.playerCount.textContent = playerCountText;
    }
    
    if (elements.footerPlayerCount) {
        elements.footerPlayerCount.textContent = playerCountText;
    }
}

/**
 * Start background tasks
 */
function startBackgroundTasks() {
    // Update server status periodically
    setInterval(updateServerStatus, CONFIG.STATUS_CHECK_INTERVAL);
    
    // Clean up old notifications
    setInterval(() => {
        if (state.notifications.length > 5) {
            const oldNotifications = state.notifications.slice(0, -5);
            oldNotifications.forEach(removeNotification);
        }
    }, 60000);
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
    if (!document.hidden) {
        // Page became visible, refresh server status
        updateServerStatus();
    }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    if (elements.loadingScreen) {
        elements.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            elements.loadingScreen.style.display = 'none';
        }, 500);
    }
}

/**
 * Show loading spinner
 */
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'pageLoadingSpinner';
    spinner.className = 'page-loading-spinner';
    spinner.innerHTML = `
        <div class="spinner-overlay">
            <div class="spinner-content">
                <div class="spinner-icon">
                    <i class="fas fa-circle-notch fa-spin"></i>
                </div>
                <p>Обработка платежа...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(spinner);
    
    // Animate in
    setTimeout(() => {
        spinner.classList.add('show');
    }, 10);
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('pageLoadingSpinner');
    if (spinner) {
        spinner.classList.remove('show');
        setTimeout(() => {
            spinner.remove();
        }, 300);
    }
}

/**
 * Create particle effects
 */
function createSelectionEffect() {
    // Create particles around the selected package
    const selectedCard = document.querySelector(`[data-package="${state.selectedPackage.type}"]`);
    if (!selectedCard) return;
    
    const rect = selectedCard.getBoundingClientRect();
    const particles = [];
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'selection-particle';
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = (i / 15) * Math.PI * 2;
        const velocity = 2 + Math.random() * 2;
        const life = 1500;
        
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
            vy += 0.05; // gravity
            opacity = 1 - progress;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
}

/**
 * Create confetti effect for successful payment
 */
function createConfettiEffect() {
    const colors = ['#6c5ce7', '#fd79a8', '#00d2d3', '#00b894', '#fdcb6e'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createConfettiParticle(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
}

/**
 * Create single confetti particle
 */
function createConfettiParticle(color) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        pointer-events: none;
        z-index: 10000;
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        transform: rotate(${Math.random() * 360}deg);
    `;
    
    document.body.appendChild(particle);
    
    const vx = (Math.random() - 0.5) * 4;
    const vy = Math.random() * 2 + 2;
    const gravity = 0.1;
    const life = 3000;
    
    let x = parseInt(particle.style.left);
    let y = parseInt(particle.style.top);
    let velocityX = vx;
    let velocityY = vy;
    let rotation = 0;
    
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= life || y > window.innerHeight) {
            particle.remove();
            return;
        }
        
        x += velocityX;
        y += velocityY;
        velocityY += gravity;
        rotation += 5;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.transform = `rotate(${rotation}deg)`;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/**
 * Utility function to check if element is in viewport
 */
function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Track analytics events
 */
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
    
    // Yandex Metrica
    if (typeof ym !== 'undefined') {
        ym(123456789, 'reachGoal', eventName, parameters);
    }
    
    console.log('📊 Event tracked:', eventName, parameters);
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    // Real-time validation for nickname
    const nicknameField = document.getElementById('nickname');
    if (nicknameField) {
        nicknameField.addEventListener('input', (e) => {
            const value = e.target.value;
            const isValid = validateNickname(value);
            
            e.target.classList.toggle('invalid', !isValid && value.length > 0);
            e.target.classList.toggle('valid', isValid);
        });
    }
    
    // Real-time validation for email
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('input', (e) => {
            const value = e.target.value;
            const isValid = validateEmail(value);
            
            e.target.classList.toggle('invalid', !isValid && value.length > 0);
            e.target.classList.toggle('valid', isValid);
        });
    }
}

/**
 * Initialize notifications system
 */
function initializeNotifications() {
    // Welcome notification
    setTimeout(() => {
        showNotification('Добро пожаловать в донат магазин 17yotk MC Server! 🎮', 'info');
    }, 1000);
    
    // Check for saved notifications
    const savedNotifications = localStorage.getItem('saved_notifications');
    if (savedNotifications) {
        try {
            const notifications = JSON.parse(savedNotifications);
            notifications.forEach(notif => {
                if (Date.now() - notif.timestamp < 3600000) { // 1 hour
                    showNotification(notif.message, notif.type, 0);
                }
            });
        } catch (error) {
            console.error('Failed to load saved notifications:', error);
        }
    }
}

/**
 * Create modal dialog
 */
function createModal({ title, content, showCloseButton = true, autoClose = true }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                ${showCloseButton ? '<button class="modal-close"><i class="fas fa-times"></i></button>' : ''}
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    if (showCloseButton) {
        modal.querySelector('.modal-close').addEventListener('click', () => {
            closeModal(modal);
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Auto close
    if (autoClose) {
        setTimeout(() => {
            closeModal(modal);
        }, 5000);
    }
    
    return modal;
}

/**
 * Close modal
 */
function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

// Initialize when DOM is ready
console.log('🔧 Script loaded, document state:', document.readyState);

if (document.readyState === 'loading') {
    console.log('⏳ Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', init);
} else {
    console.log('🚀 DOM already loaded, initializing...');
    init();
}

// Export functions for global access
window.selectPackage = selectPackage;
window.closePurchaseForm = closePurchaseForm;
window.showPurchaseFormFromCart = showPurchaseFormFromCart;
window.copyServerIP = copyServerIP;
window.copyEmail = copyEmail;
window.toggleFAQ = toggleFAQ;
window.removeNotificationById = removeNotificationById;