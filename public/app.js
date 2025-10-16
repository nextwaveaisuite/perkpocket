// PerkPocket Main Application
class PerkPocketApp {
    constructor() {
        this.currentUser = null;
        this.currentMarket = null;
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.navigationStack = [];
        this.offers = [];
        this.networks = [];
        this.userBalance = 0;
        this.userGoal = 100;
        this.activityHistory = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.initializeUser();
            this.setupEventListeners();
            this.updateUI();
            console.log('PerkPocket initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerkPocket:', error);
            this.showError('Failed to load application data');
        }
    }

    async loadData() {
        try {
            // Load offers data
            const offersResponse = await fetch('./offers.json');
            if (!offersResponse.ok) throw new Error('Failed to load offers');
            const offersData = await offersResponse.json();
            this.offers = offersData.offers;

            // Load networks data
            const networksResponse = await fetch('./networks.json');
            if (!networksResponse.ok) throw new Error('Failed to load networks');
            const networksData = await networksResponse.json();
            this.networks = networksData.networks;

        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to empty arrays
            this.offers = [];
            this.networks = [];
        }
    }

    initializeUser() {
        // Get or create device ID
        let deviceId = localStorage.getItem('perkpocket_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('perkpocket_device_id', deviceId);
        }

        // Load user data
        const userData = localStorage.getItem('perkpocket_user_data');
        if (userData) {
            const parsed = JSON.parse(userData);
            this.userBalance = parsed.balance || 0;
            this.userGoal = parsed.goal || 100;
            this.activityHistory = parsed.history || [];
        }

        this.currentUser = { deviceId };
    }

    setupEventListeners() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    updateUI() {
        this.updateBalance();
        this.updateProgress();
        this.updateHistory();
        this.updateReferralLink();
    }

    updateBalance() {
        const balanceElement = document.getElementById('userBalance');
        const cashoutBalanceElement = document.getElementById('cashoutBalance');
        const cashoutBtn = document.getElementById('cashoutBtn');
        
        if (balanceElement) {
            balanceElement.textContent = `$${this.userBalance.toFixed(2)}`;
        }
        
        if (cashoutBalanceElement) {
            cashoutBalanceElement.textContent = `$${this.userBalance.toFixed(2)}`;
        }
        
        if (cashoutBtn) {
            cashoutBtn.disabled = this.userBalance < 10;
        }
    }

    updateProgress() {
        const goalProgressElement = document.getElementById('goalProgress');
        const progressFillElement = document.getElementById('progressFill');
        
        const remaining = Math.max(0, this.userGoal - this.userBalance);
        const progressPercent = Math.min(100, (this.userBalance / this.userGoal) * 100);
        
        if (goalProgressElement) {
            if (remaining === 0) {
                goalProgressElement.textContent = 'Goal Reached! 🎉';
            } else {
                goalProgressElement.textContent = `$${remaining.toFixed(2)} away`;
            }
        }
        
        if (progressFillElement) {
            progressFillElement.style.width = `${progressPercent}%`;
        }
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.activityHistory.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <span class="history-icon">📋</span>
                    <p>No activity yet. Complete your first offer to get started!</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = this.activityHistory
            .slice(-5) // Show last 5 activities
            .reverse()
            .map(activity => `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-title">${activity.title}</div>
                        <div class="history-desc">${activity.description}</div>
                    </div>
                    <div class="history-amount">+$${activity.amount.toFixed(2)}</div>
                </div>
            `).join('');
    }

    updateReferralLink() {
        const referralLinkElement = document.getElementById('referralLink');
        if (referralLinkElement && this.currentUser) {
            const baseUrl = window.location.origin + window.location.pathname;
            referralLinkElement.value = `${baseUrl}?ref=${this.currentUser.deviceId}`;
        }
    }

    saveUserData() {
        const userData = {
            balance: this.userBalance,
            goal: this.userGoal,
            history: this.activityHistory
        };
        localStorage.setItem('perkpocket_user_data', JSON.stringify(userData));
    }

    // Navigation Methods
    selectMarket(market) {
        this.currentMarket = market;
        this.navigationStack = ['market'];
        this.showCategorySelection();
    }

    showCategorySelection() {
        this.hideAllSections();
        
        const categorySection = document.getElementById('categorySection');
        const categoryGrid = document.getElementById('categoryGrid');
        
        if (!categorySection || !categoryGrid) return;

        const categories = [
            {
                id: 'meal_kits',
                icon: '🍽️',
                name: 'Meal Kits',
                desc: 'Recipe boxes & meal delivery'
            },
            {
                id: 'app_installs',
                icon: '📱',
                name: 'App Installs',
                desc: 'Games, utilities & mobile apps'
            },
            {
                id: 'freebies',
                icon: '🎁',
                name: 'Freebies',
                desc: 'Samples, surveys & free trials'
            },
            {
                id: 'groceries_fuel',
                icon: '⛽',
                name: 'Groceries & Fuel',
                desc: 'Shopping rewards & fuel discounts'
            }
        ];

        categoryGrid.innerHTML = categories.map(category => `
            <div class="category-card" onclick="app.selectCategory('${category.id}')">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-desc">${category.desc}</div>
            </div>
        `).join('');

        categorySection.style.display = 'block';
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.navigationStack.push('category');
        this.showSubcategorySelection();
    }

    showSubcategorySelection() {
        const subcategories = this.getSubcategoriesForCategory(this.currentCategory);
        
        if (subcategories.length <= 1) {
            // Skip subcategory selection if only one or no subcategories
            this.currentSubcategory = subcategories[0]?.id || null;
            this.showOffers();
            return;
        }

        this.hideAllSections();
        
        const subcategorySection = document.getElementById('subcategorySection');
        const subcategoryGrid = document.getElementById('subcategoryGrid');
        
        if (!subcategorySection || !subcategoryGrid) return;

        subcategoryGrid.innerHTML = subcategories.map(subcategory => `
            <div class="subcategory-card" onclick="app.selectSubcategory('${subcategory.id}')">
                <div class="subcategory-icon">${subcategory.icon}</div>
                <div class="subcategory-name">${subcategory.name}</div>
                <div class="subcategory-desc">${subcategory.desc}</div>
            </div>
        `).join('');

        subcategorySection.style.display = 'block';
    }

    selectSubcategory(subcategory) {
        this.currentSubcategory = subcategory;
        this.navigationStack.push('subcategory');
        this.showOffers();
    }

    showOffers() {
        this.hideAllSections();
        
        const offersSection = document.getElementById('offersSection');
        const offersGrid = document.getElementById('offersGrid');
        
        if (!offersSection || !offersGrid) return;

        const filteredOffers = this.getFilteredOffers();
        
        if (filteredOffers.length === 0) {
            offersGrid.innerHTML = `
                <div class="no-offers">
                    <span class="no-offers-icon">😔</span>
                    <h3>No offers available</h3>
                    <p>Check back soon for new offers in this category!</p>
                </div>
            `;
        } else {
            offersGrid.innerHTML = filteredOffers.map(offer => `
                <div class="offer-card">
                    <div class="offer-header">
                        <div>
                            <div class="offer-title">${offer.title}</div>
                        </div>
                        <div class="offer-payout">$${offer.payout.toFixed(2)}</div>
                    </div>
                    <div class="offer-desc">${offer.description}</div>
                    <div class="offer-actions">
                        <button class="offer-btn offer-btn-primary" onclick="app.openOffer('${offer.id}')">
                            Open Offer
                        </button>
                        <button class="offer-btn offer-btn-secondary" onclick="app.simulateCompletion('${offer.id}')">
                            Simulate Completion
                        </button>
                    </div>
                </div>
            `).join('');
        }

        offersSection.style.display = 'block';
    }

    getSubcategoriesForCategory(category) {
        const subcategoryMap = {
            meal_kits: [
                { id: 'premium_kits', icon: '⭐', name: 'Premium Kits', desc: 'High-end meal services' },
                { id: 'budget_kits', icon: '💰', name: 'Budget Kits', desc: 'Affordable meal options' },
                { id: 'specialty_diets', icon: '🥗', name: 'Specialty Diets', desc: 'Healthy & dietary options' }
            ],
            app_installs: [
                { id: 'gaming_apps', icon: '🎮', name: 'Gaming Apps', desc: 'Mobile games & entertainment' },
                { id: 'utility_apps', icon: '🛠️', name: 'Utility Apps', desc: 'Tools & productivity apps' }
            ],
            freebies: [
                { id: 'samples', icon: '📦', name: 'Samples', desc: 'Free product samples' },
                { id: 'surveys', icon: '📊', name: 'Surveys', desc: 'Opinion polls & research' },
                { id: 'trials', icon: '🆓', name: 'Trials', desc: 'Free trials & testing' }
            ],
            groceries_fuel: [
                { id: 'supermarkets', icon: '🛒', name: 'Supermarkets', desc: 'Grocery shopping rewards' },
                { id: 'fuel_stations', icon: '⛽', name: 'Fuel Stations', desc: 'Fuel discounts & rewards' }
            ]
        };

        return subcategoryMap[category] || [];
    }

    getFilteredOffers() {
        return this.offers.filter(offer => {
            if (offer.market !== this.currentMarket) return false;
            if (offer.category !== this.currentCategory) return false;
            if (this.currentSubcategory && offer.subcategory !== this.currentSubcategory) return false;
            return true;
        });
    }

    // Offer Actions
    openOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (!offer) return;

        // Track click
        this.trackOfferClick(offer);
        
        // Open offer URL
        window.open(offer.url, '_blank');
    }

    simulateCompletion(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (!offer) return;

        // Add to balance
        this.userBalance += offer.payout;
        
        // Add to history
        this.activityHistory.push({
            title: offer.title,
            description: `Completed offer and earned $${offer.payout.toFixed(2)}`,
            amount: offer.payout,
            timestamp: new Date().toISOString()
        });

        // Save data
        this.saveUserData();
        
        // Update UI
        this.updateUI();
        
        // Show success message
        this.showSuccess(`Earned $${offer.payout.toFixed(2)} from ${offer.title}!`);
    }

    trackOfferClick(offer) {
        // Track offer clicks for analytics
        console.log('Offer clicked:', offer.title);
        
        // You can implement analytics tracking here
        // Example: Google Analytics, Facebook Pixel, etc.
    }

    // Navigation
    goBack() {
        if (this.navigationStack.length === 0) return;

        this.navigationStack.pop();
        const previousSection = this.navigationStack[this.navigationStack.length - 1];

        switch (previousSection) {
            case 'market':
                this.showMarketSelection();
                break;
            case 'category':
                this.showCategorySelection();
                break;
            case 'subcategory':
                this.showSubcategorySelection();
                break;
            default:
                this.showMarketSelection();
        }
    }

    showMarketSelection() {
        this.hideAllSections();
        document.getElementById('marketSection').style.display = 'block';
        this.currentMarket = null;
        this.currentCategory = null;
        this.currentSubcategory = null;
        this.navigationStack = [];
    }

    hideAllSections() {
        const sections = [
            'marketSection',
            'categorySection', 
            'subcategorySection',
            'offersSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // User Actions
    showCashout() {
        if (this.userBalance < 10) {
            this.showError('Minimum cashout amount is $10.00');
            return;
        }
        this.showModal('cashoutModal');
    }

    showReferral() {
        this.showModal('referralModal');
    }

    showHelp() {
        this.showModal('helpModal');
    }

    copyReferralLink() {
        const referralLinkElement = document.getElementById('referralLink');
        if (referralLinkElement) {
            referralLinkElement.select();
            document.execCommand('copy');
            this.showSuccess('Referral link copied to clipboard!');
        }
    }

    // Utility Methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#4ade80',
            error: '#ef4444',
            info: '#4a90e2'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
}

// Global functions for HTML onclick events
function selectMarket(market) {
    app.selectMarket(market);
}

function selectCategory(category) {
    app.selectCategory(category);
}

function selectSubcategory(subcategory) {
    app.selectSubcategory(subcategory);
}

function goBack() {
    app.goBack();
}

function showCashout() {
    app.showCashout();
}

function showReferral() {
    app.showReferral();
}

function showHelp() {
    app.showHelp();
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function copyReferralLink() {
    app.copyReferralLink();
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.classList.toggle('active');
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PerkPocketApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkPocketApp;
}

