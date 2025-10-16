// PerkPocket Offer Wire - Analytics and Tracking
class OfferWire {
    constructor() {
        this.trackingData = {
            sessions: [],
            clicks: [],
            conversions: [],
            referrals: []
        };
        
        this.currentSession = null;
        this.init();
    }
    
    init() {
        this.startSession();
        this.setupEventListeners();
        this.loadTrackingData();
    }
    
    startSession() {
        this.currentSession = {
            id: this.generateId(),
            deviceId: this.getDeviceId(),
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            market: null,
            category: null,
            subcategory: null,
            offers_viewed: [],
            offers_clicked: [],
            time_spent: 0,
            page_views: 1
        };
        
        // Check for referral parameter
        const urlParams = new URLSearchParams(window.location.search);
        const referralId = urlParams.get('ref');
        if (referralId) {
            this.trackReferral(referralId);
        }
        
        this.saveTrackingData();
    }
    
    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
        
        // Track before page unload
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.currentSession.max_scroll_depth = maxScrollDepth;
            }
        });
    }
    
    loadTrackingData() {
        const stored = localStorage.getItem('perkpocket_tracking');
        if (stored) {
            try {
                this.trackingData = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to load tracking data:', error);
            }
        }
    }
    
    saveTrackingData() {
        try {
            localStorage.setItem('perkpocket_tracking', JSON.stringify(this.trackingData));
        } catch (error) {
            console.error('Failed to save tracking data:', error);
        }
    }
    
    // Session Management
    pauseSession() {
        if (this.currentSession && !this.currentSession.paused) {
            this.currentSession.paused = true;
            this.currentSession.pause_time = new Date().toISOString();
        }
    }
    
    resumeSession() {
        if (this.currentSession && this.currentSession.paused) {
            this.currentSession.paused = false;
            const pauseDuration = new Date() - new Date(this.currentSession.pause_time);
            this.currentSession.total_pause_time = (this.currentSession.total_pause_time || 0) + pauseDuration;
        }
    }
    
    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = new Date().toISOString();
            this.currentSession.duration = new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime);
            
            this.trackingData.sessions.push(this.currentSession);
            this.saveTrackingData();
        }
    }
    
    // Navigation Tracking
    trackMarketSelection(market) {
        if (this.currentSession) {
            this.currentSession.market = market;
            this.trackEvent('market_selected', { market });
        }
    }
    
    trackCategorySelection(category) {
        if (this.currentSession) {
            this.currentSession.category = category;
            this.trackEvent('category_selected', { category });
        }
    }
    
    trackSubcategorySelection(subcategory) {
        if (this.currentSession) {
            this.currentSession.subcategory = subcategory;
            this.trackEvent('subcategory_selected', { subcategory });
        }
    }
    
    // Offer Tracking
    trackOfferView(offer) {
        if (this.currentSession) {
            if (!this.currentSession.offers_viewed.includes(offer.id)) {
                this.currentSession.offers_viewed.push(offer.id);
            }
        }
        
        this.trackEvent('offer_viewed', {
            offer_id: offer.id,
            offer_title: offer.title,
            market: offer.market,
            category: offer.category,
            subcategory: offer.subcategory,
            payout: offer.payout
        });
    }
    
    trackOfferClick(offer) {
        const clickData = {
            id: this.generateId(),
            session_id: this.currentSession?.id,
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            offer_id: offer.id,
            offer_title: offer.title,
            market: offer.market,
            category: offer.category,
            subcategory: offer.subcategory,
            payout: offer.payout,
            network: offer.network,
            url: offer.url
        };
        
        this.trackingData.clicks.push(clickData);
        
        if (this.currentSession) {
            if (!this.currentSession.offers_clicked.includes(offer.id)) {
                this.currentSession.offers_clicked.push(offer.id);
            }
        }
        
        this.trackEvent('offer_clicked', clickData);
        this.saveTrackingData();
        
        // Send to analytics if available
        this.sendToAnalytics('offer_click', clickData);
    }
    
    trackOfferCompletion(offer, amount) {
        const conversionData = {
            id: this.generateId(),
            session_id: this.currentSession?.id,
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            offer_id: offer.id,
            offer_title: offer.title,
            market: offer.market,
            category: offer.category,
            subcategory: offer.subcategory,
            payout: offer.payout,
            actual_amount: amount,
            network: offer.network,
            conversion_type: 'simulated' // or 'real' for actual completions
        };
        
        this.trackingData.conversions.push(conversionData);
        this.trackEvent('offer_completed', conversionData);
        this.saveTrackingData();
        
        // Send to analytics
        this.sendToAnalytics('conversion', conversionData);
    }
    
    // Referral Tracking
    trackReferral(referralId) {
        const referralData = {
            id: this.generateId(),
            session_id: this.currentSession?.id,
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString(),
            referrer_id: referralId,
            referred_device_id: this.getDeviceId()
        };
        
        this.trackingData.referrals.push(referralData);
        this.trackEvent('referral_visit', referralData);
        this.saveTrackingData();
        
        // Send to analytics
        this.sendToAnalytics('referral', referralData);
    }
    
    // User Actions
    trackCashoutRequest(amount, method) {
        this.trackEvent('cashout_requested', {
            amount,
            method,
            balance: app?.userBalance || 0,
            timestamp: new Date().toISOString()
        });
    }
    
    trackReferralLinkCopy() {
        this.trackEvent('referral_link_copied', {
            timestamp: new Date().toISOString()
        });
    }
    
    trackChatbotInteraction(message, response) {
        this.trackEvent('chatbot_interaction', {
            user_message: message,
            bot_response: response,
            timestamp: new Date().toISOString()
        });
    }
    
    // Generic Event Tracking
    trackEvent(eventName, eventData) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            session_id: this.currentSession?.id,
            device_id: this.getDeviceId()
        };
        
        // Store in session storage for immediate access
        const events = JSON.parse(sessionStorage.getItem('perkpocket_events') || '[]');
        events.push(event);
        sessionStorage.setItem('perkpocket_events', JSON.stringify(events));
        
        console.log('Event tracked:', eventName, eventData);
    }
    
    // Analytics Integration
    sendToAnalytics(eventType, data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                custom_parameter_1: data.offer_id,
                custom_parameter_2: data.market,
                custom_parameter_3: data.category,
                value: data.payout || data.amount || 0
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'CustomEvent', {
                event_type: eventType,
                offer_id: data.offer_id,
                market: data.market,
                value: data.payout || data.amount || 0
            });
        }
        
        // Custom analytics endpoint (if you have one)
        this.sendToCustomAnalytics(eventType, data);
    }
    
    sendToCustomAnalytics(eventType, data) {
        // Example: Send to your own analytics endpoint
        /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: eventType,
                data: data,
                timestamp: new Date().toISOString()
            })
        }).catch(error => {
            console.error('Failed to send analytics:', error);
        });
        */
    }
    
    // Reporting and Analytics
    getSessionStats() {
        return {
            total_sessions: this.trackingData.sessions.length,
            total_clicks: this.trackingData.clicks.length,
            total_conversions: this.trackingData.conversions.length,
            total_referrals: this.trackingData.referrals.length,
            conversion_rate: this.trackingData.clicks.length > 0 ? 
                (this.trackingData.conversions.length / this.trackingData.clicks.length * 100).toFixed(2) + '%' : '0%'
        };
    }
    
    getOfferPerformance() {
        const offerStats = {};
        
        this.trackingData.clicks.forEach(click => {
            if (!offerStats[click.offer_id]) {
                offerStats[click.offer_id] = {
                    title: click.offer_title,
                    clicks: 0,
                    conversions: 0,
                    revenue: 0
                };
            }
            offerStats[click.offer_id].clicks++;
        });
        
        this.trackingData.conversions.forEach(conversion => {
            if (offerStats[conversion.offer_id]) {
                offerStats[conversion.offer_id].conversions++;
                offerStats[conversion.offer_id].revenue += conversion.actual_amount;
            }
        });
        
        return offerStats;
    }
    
    getMarketPerformance() {
        const marketStats = {};
        
        this.trackingData.clicks.forEach(click => {
            if (!marketStats[click.market]) {
                marketStats[click.market] = { clicks: 0, conversions: 0, revenue: 0 };
            }
            marketStats[click.market].clicks++;
        });
        
        this.trackingData.conversions.forEach(conversion => {
            if (marketStats[conversion.market]) {
                marketStats[conversion.market].conversions++;
                marketStats[conversion.market].revenue += conversion.actual_amount;
            }
        });
        
        return marketStats;
    }
    
    // Utility Methods
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('perkpocket_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('perkpocket_device_id', deviceId);
        }
        return deviceId;
    }
    
    // Data Export
    exportTrackingData() {
        const data = {
            ...this.trackingData,
            exported_at: new Date().toISOString(),
            stats: this.getSessionStats(),
            offer_performance: this.getOfferPerformance(),
            market_performance: this.getMarketPerformance()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perkpocket_analytics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Clear tracking data (for privacy)
    clearTrackingData() {
        this.trackingData = {
            sessions: [],
            clicks: [],
            conversions: [],
            referrals: []
        };
        localStorage.removeItem('perkpocket_tracking');
        sessionStorage.removeItem('perkpocket_events');
    }
}

// Initialize tracking when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.offerWire = new OfferWire();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfferWire;
}

