// Security and hCaptcha verification
class SecurityManager {
    constructor() {
        this.isVerified = false;
        this.init();
    }

    init() {
        // Show security modal on page load
        this.showSecurityModal();
        
        // Skip button for demo purposes
        document.getElementById('skipVerification').addEventListener('click', () => {
            this.bypassVerification();
        });
    }

    showSecurityModal() {
        const modal = document.getElementById('securityModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideSecurityModal() {
        const modal = document.getElementById('securityModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    bypassVerification() {
        this.isVerified = true;
        this.hideSecurityModal();
        this.logSecurityEvent('verification_bypassed');
    }

    onCaptchaSuccess(token) {
        this.isVerified = true;
        this.hideSecurityModal();
        this.logSecurityEvent('captcha_verified', { token });
        
        // Show success message
        this.showNotification('✅ Verification successful! Welcome to PerkPocket.', 'success');
    }

    onCaptchaError() {
        this.logSecurityEvent('captcha_error');
        this.showNotification('❌ Verification failed. Please try again.', 'error');
    }

    validateUserAction(action) {
        if (!this.isVerified) {
            this.showSecurityModal();
            return false;
        }
        return true;
    }

    logSecurityEvent(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            userAgent: navigator.userAgent,
            ip: 'client-side', // Would be handled server-side in production
            ...data
        };
        
        console.log('Security Event:', logEntry);
        
        // In production, send to security monitoring service
        // this.sendToSecurityService(logEntry);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Bot detection methods
    detectBot() {
        const botSignals = [];
        
        // Check for headless browser
        if (navigator.webdriver) {
            botSignals.push('webdriver_detected');
        }
        
        // Check for automation tools
        if (window.phantom || window._phantom || window.callPhantom) {
            botSignals.push('phantom_detected');
        }
        
        // Check for unusual user agent
        const ua = navigator.userAgent.toLowerCase();
        const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
        if (botPatterns.some(pattern => ua.includes(pattern))) {
            botSignals.push('bot_user_agent');
        }
        
        // Check for missing features
        if (!window.chrome && !window.safari && !window.firefox) {
            botSignals.push('unusual_browser');
        }
        
        if (botSignals.length > 0) {
            this.logSecurityEvent('bot_detected', { signals: botSignals });
            return true;
        }
        
        return false;
    }

    // Rate limiting
    checkRateLimit(action) {
        const key = `rate_limit_${action}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxRequests = 10;
        
        let requests = JSON.parse(localStorage.getItem(key) || '[]');
        requests = requests.filter(time => now - time < windowMs);
        
        if (requests.length >= maxRequests) {
            this.logSecurityEvent('rate_limit_exceeded', { action });
            this.showNotification('⚠️ Too many requests. Please wait a moment.', 'warning');
            return false;
        }
        
        requests.push(now);
        localStorage.setItem(key, JSON.stringify(requests));
        return true;
    }
}

// Global hCaptcha callback
function onCaptchaSuccess(token) {
    window.securityManager.onCaptchaSuccess(token);
}

function onCaptchaError() {
    window.securityManager.onCaptchaError();
}

// Initialize security manager
window.securityManager = new SecurityManager();

// Enhanced click tracking with security
document.addEventListener('click', (e) => {
    // Check for suspicious rapid clicking
    if (!window.securityManager.checkRateLimit('click')) {
        e.preventDefault();
        return;
    }
    
    // Log offer clicks for fraud detection
    if (e.target.closest('.offer-card')) {
        window.securityManager.logSecurityEvent('offer_click', {
            offer: e.target.closest('.offer-card').dataset.offer
        });
    }
});

// Monitor for suspicious behavior
let mouseMovements = 0;
let keystrokes = 0;

document.addEventListener('mousemove', () => {
    mouseMovements++;
});

document.addEventListener('keydown', () => {
    keystrokes++;
});

// Check for human-like behavior after 30 seconds
setTimeout(() => {
    if (mouseMovements < 5 && keystrokes < 3) {
        window.securityManager.logSecurityEvent('suspicious_behavior', {
            mouseMovements,
            keystrokes
        });
    }
}, 30000);

