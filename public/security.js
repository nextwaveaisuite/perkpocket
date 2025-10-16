// PerkPocket Security Module
class PerkPocketSecurity {
    constructor() {
        this.securityConfig = {
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            rateLimitWindow: 60 * 1000, // 1 minute
            maxRequestsPerWindow: 100,
            suspiciousActivityThreshold: 10
        };
        
        this.securityState = {
            loginAttempts: 0,
            lockedUntil: null,
            lastActivity: Date.now(),
            requestCount: 0,
            requestWindowStart: Date.now(),
            suspiciousActivity: 0,
            blockedIPs: [],
            securityEvents: []
        };
        
        this.init();
    }
    
    init() {
        this.loadSecurityState();
        this.setupSecurityMonitoring();
        this.setupCSRFProtection();
        this.setupContentSecurityPolicy();
        this.startSecurityChecks();
    }
    
    loadSecurityState() {
        const stored = localStorage.getItem('perkpocket_security');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.securityState = { ...this.securityState, ...parsed };
            } catch (error) {
                console.error('Failed to load security state:', error);
            }
        }
    }
    
    saveSecurityState() {
        try {
            localStorage.setItem('perkpocket_security', JSON.stringify(this.securityState));
        } catch (error) {
            console.error('Failed to save security state:', error);
        }
    }
    
    // CSRF Protection
    setupCSRFProtection() {
        // Generate CSRF token
        this.csrfToken = this.generateCSRFToken();
        
        // Add CSRF token to all forms
        this.addCSRFTokenToForms();
        
        // Validate CSRF token on form submissions
        this.setupCSRFValidation();
    }
    
    generateCSRFToken() {
        const token = 'csrf_' + Math.random().toString(36).substr(2, 32) + '_' + Date.now();
        sessionStorage.setItem('perkpocket_csrf_token', token);
        return token;
    }
    
    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = this.csrfToken;
            form.appendChild(csrfInput);
        });
    }
    
    setupCSRFValidation() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const csrfInput = form.querySelector('input[name="csrf_token"]');
                if (!csrfInput || csrfInput.value !== this.csrfToken) {
                    e.preventDefault();
                    this.logSecurityEvent('csrf_validation_failed', { form: form.id });
                    this.showSecurityAlert('Security validation failed. Please refresh the page.');
                }
            }
        });
    }
    
    // Content Security Policy
    setupContentSecurityPolicy() {
        // Add CSP meta tag if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;";
            document.head.appendChild(cspMeta);
        }
    }
    
    // Rate Limiting
    checkRateLimit() {
        const now = Date.now();
        
        // Reset window if expired
        if (now - this.securityState.requestWindowStart > this.securityConfig.rateLimitWindow) {
            this.securityState.requestCount = 0;
            this.securityState.requestWindowStart = now;
        }
        
        this.securityState.requestCount++;
        
        if (this.securityState.requestCount > this.securityConfig.maxRequestsPerWindow) {
            this.logSecurityEvent('rate_limit_exceeded', {
                requests: this.securityState.requestCount,
                window: this.securityConfig.rateLimitWindow
            });
            return false;
        }
        
        return true;
    }
    
    // Admin Authentication Security
    validateAdminAccess(adminKey) {
        // Check if account is locked
        if (this.isAccountLocked()) {
            this.logSecurityEvent('admin_access_attempt_while_locked');
            return { success: false, message: 'Account temporarily locked due to multiple failed attempts' };
        }
        
        // Check rate limiting
        if (!this.checkRateLimit()) {
            this.logSecurityEvent('admin_rate_limit_exceeded');
            return { success: false, message: 'Too many requests. Please try again later.' };
        }
        
        // Validate admin key (in real implementation, this should be hashed)
        const validKey = 'admin-secret-key-here'; // This should come from environment variables
        
        if (adminKey !== validKey) {
            this.securityState.loginAttempts++;
            this.logSecurityEvent('admin_login_failed', { attempts: this.securityState.loginAttempts });
            
            if (this.securityState.loginAttempts >= this.securityConfig.maxLoginAttempts) {
                this.lockAccount();
                this.logSecurityEvent('admin_account_locked');
                return { success: false, message: 'Account locked due to multiple failed attempts' };
            }
            
            return { success: false, message: 'Invalid admin key' };
        }
        
        // Successful login
        this.securityState.loginAttempts = 0;
        this.securityState.lastActivity = Date.now();
        this.logSecurityEvent('admin_login_success');
        this.saveSecurityState();
        
        return { success: true, message: 'Access granted' };
    }
    
    isAccountLocked() {
        if (this.securityState.lockedUntil && Date.now() < this.securityState.lockedUntil) {
            return true;
        }
        
        if (this.securityState.lockedUntil && Date.now() >= this.securityState.lockedUntil) {
            // Unlock account
            this.securityState.lockedUntil = null;
            this.securityState.loginAttempts = 0;
            this.saveSecurityState();
        }
        
        return false;
    }
    
    lockAccount() {
        this.securityState.lockedUntil = Date.now() + this.securityConfig.lockoutDuration;
        this.saveSecurityState();
    }
    
    // Session Management
    checkSessionTimeout() {
        const now = Date.now();
        if (now - this.securityState.lastActivity > this.securityConfig.sessionTimeout) {
            this.logSecurityEvent('session_timeout');
            this.clearSession();
            return false;
        }
        return true;
    }
    
    updateActivity() {
        this.securityState.lastActivity = Date.now();
        this.saveSecurityState();
    }
    
    clearSession() {
        sessionStorage.removeItem('perkpocket_admin_session');
        this.securityState.lastActivity = 0;
        this.saveSecurityState();
    }
    
    // Security Monitoring
    setupSecurityMonitoring() {
        // Monitor for suspicious activity
        this.monitorDevTools();
        this.monitorConsoleAccess();
        this.monitorNetworkRequests();
        this.monitorDOMManipulation();
        
        // Set up activity tracking
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('scroll', () => this.updateActivity());
    }
    
    monitorDevTools() {
        // Detect if developer tools are open
        let devtools = { open: false, orientation: null };
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.logSecurityEvent('devtools_opened');
                    this.handleSuspiciousActivity('Developer tools detected');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    monitorConsoleAccess() {
        // Override console methods to detect usage
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            this.logSecurityEvent('console_access', { method: 'log', args: args.length });
            return originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.logSecurityEvent('console_access', { method: 'error', args: args.length });
            return originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.logSecurityEvent('console_access', { method: 'warn', args: args.length });
            return originalWarn.apply(console, args);
        };
    }
    
    monitorNetworkRequests() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            this.logSecurityEvent('network_request', { url: args[0] });
            return originalFetch.apply(window, args);
        };
        
        // Monitor XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            xhr.open = function(method, url) {
                window.security.logSecurityEvent('xhr_request', { method, url });
                return originalOpen.apply(xhr, arguments);
            };
            return xhr;
        };
    }
    
    monitorDOMManipulation() {
        // Monitor for suspicious DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for suspicious script injections
                            if (node.tagName === 'SCRIPT' || node.innerHTML.includes('<script')) {
                                this.logSecurityEvent('suspicious_script_injection', { 
                                    tagName: node.tagName,
                                    innerHTML: node.innerHTML.substring(0, 100)
                                });
                                this.handleSuspiciousActivity('Suspicious script injection detected');
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Suspicious Activity Handling
    handleSuspiciousActivity(reason) {
        this.securityState.suspiciousActivity++;
        this.logSecurityEvent('suspicious_activity', { reason, count: this.securityState.suspiciousActivity });
        
        if (this.securityState.suspiciousActivity >= this.securityConfig.suspiciousActivityThreshold) {
            this.triggerSecurityLockdown(reason);
        }
        
        this.saveSecurityState();
    }
    
    triggerSecurityLockdown(reason) {
        this.logSecurityEvent('security_lockdown', { reason });
        this.clearSession();
        this.showSecurityAlert('Security lockdown activated. Please refresh the page and contact support if this continues.');
        
        // Disable certain functionality
        this.disableAdminFunctions();
    }
    
    disableAdminFunctions() {
        // Disable admin panel access
        const adminElements = document.querySelectorAll('[data-admin-function]');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    // Input Validation and Sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    
    validateInput(input, type) {
        switch (type) {
            case 'admin_key':
                return /^[a-zA-Z0-9\-_]{10,50}$/.test(input);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            case 'amount':
                return /^\d+(\.\d{1,2})?$/.test(input) && parseFloat(input) >= 0;
            case 'device_id':
                return /^[a-zA-Z0-9_]{5,20}$/.test(input);
            default:
                return true;
        }
    }
    
    // Captcha Integration (Simple Implementation)
    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        sessionStorage.setItem('perkpocket_captcha', captcha);
        return captcha;
    }
    
    validateCaptcha(userInput) {
        const storedCaptcha = sessionStorage.getItem('perkpocket_captcha');
        const isValid = userInput && userInput.toLowerCase() === storedCaptcha.toLowerCase();
        
        if (!isValid) {
            this.logSecurityEvent('captcha_validation_failed');
            this.handleSuspiciousActivity('Captcha validation failed');
        }
        
        // Clear captcha after validation attempt
        sessionStorage.removeItem('perkpocket_captcha');
        
        return isValid;
    }
    
    // Security Event Logging
    logSecurityEvent(eventType, data = {}) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: data,
            userAgent: navigator.userAgent,
            url: window.location.href,
            deviceId: this.getDeviceId()
        };
        
        this.securityState.securityEvents.push(event);
        
        // Keep only last 100 events to prevent storage overflow
        if (this.securityState.securityEvents.length > 100) {
            this.securityState.securityEvents = this.securityState.securityEvents.slice(-100);
        }
        
        console.warn('Security Event:', eventType, data);
        this.saveSecurityState();
    }
    
    // Security Checks
    startSecurityChecks() {
        // Run security checks every 30 seconds
        setInterval(() => {
            this.runSecurityChecks();
        }, 30000);
    }
    
    runSecurityChecks() {
        // Check session timeout
        if (!this.checkSessionTimeout()) {
            this.logSecurityEvent('security_check_session_timeout');
        }
        
        // Check for account lockout expiry
        this.isAccountLocked();
        
        // Check for suspicious patterns
        this.checkSuspiciousPatterns();
    }
    
    checkSuspiciousPatterns() {
        const recentEvents = this.securityState.securityEvents.filter(
            event => Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
        );
        
        // Check for rapid-fire requests
        const requestEvents = recentEvents.filter(event => 
            event.type === 'network_request' || event.type === 'xhr_request'
        );
        
        if (requestEvents.length > 50) {
            this.handleSuspiciousActivity('Rapid-fire requests detected');
        }
        
        // Check for multiple failed login attempts
        const failedLogins = recentEvents.filter(event => event.type === 'admin_login_failed');
        if (failedLogins.length > 3) {
            this.handleSuspiciousActivity('Multiple failed login attempts');
        }
    }
    
    // Utility Methods
    getDeviceId() {
        return localStorage.getItem('perkpocket_device_id') || 'unknown';
    }
    
    showSecurityAlert(message) {
        // Create security alert
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.innerHTML = `
            <div class="security-alert-content">
                <span class="security-alert-icon">🔒</span>
                <span class="security-alert-message">${message}</span>
                <button class="security-alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Style the alert
        Object.assign(alert.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            zIndex: '10001',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            textAlign: 'center'
        });
        
        document.body.appendChild(alert);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 10000);
    }
    
    // Security Report
    generateSecurityReport() {
        return {
            timestamp: new Date().toISOString(),
            security_state: this.securityState,
            recent_events: this.securityState.securityEvents.slice(-20),
            account_status: {
                locked: this.isAccountLocked(),
                login_attempts: this.securityState.loginAttempts,
                suspicious_activity_count: this.securityState.suspiciousActivity
            },
            session_info: {
                last_activity: new Date(this.securityState.lastActivity).toISOString(),
                session_valid: this.checkSessionTimeout()
            }
        };
    }
    
    // Clear security data (for privacy)
    clearSecurityData() {
        this.securityState = {
            loginAttempts: 0,
            lockedUntil: null,
            lastActivity: Date.now(),
            requestCount: 0,
            requestWindowStart: Date.now(),
            suspiciousActivity: 0,
            blockedIPs: [],
            securityEvents: []
        };
        localStorage.removeItem('perkpocket_security');
        sessionStorage.removeItem('perkpocket_csrf_token');
        sessionStorage.removeItem('perkpocket_captcha');
    }
}

// Initialize security when DOM is loaded
// Initialize security module immediately
if (typeof window !== 'undefined') {
    window.security = new PerkPocketSecurity();
}

// Also initialize on DOMContentLoaded for compatibility
document.addEventListener('DOMContentLoaded', () => {
    if (!window.security) {
        window.security = new PerkPocketSecurity();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkPocketSecurity;
}
