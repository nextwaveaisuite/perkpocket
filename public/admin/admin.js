// PerkPocket Admin Console
class PerkPocketAdmin {
    constructor() {
        this.isAuthenticated = false;
        this.currentTab = 'overview';
        this.offers = [];
        this.networks = [];
        this.users = [];
        this.analytics = {};
        this.settings = {
            platformName: 'PerkPocket',
            minCashout: 10,
            referralBonus: 5,
            adminKey: 'admin-secret-key-here'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.generateCaptcha();
            this.checkAuthentication();
            console.log('Admin console initialized');
        } catch (error) {
            console.error('Failed to initialize admin console:', error);
        }
    }

    async loadData() {
        try {
            // Load offers
            const offersResponse = await fetch('../public/offers.json');
            if (offersResponse.ok) {
                const offersData = await offersResponse.json();
                this.offers = offersData.offers || [];
            }

            // Load networks
            const networksResponse = await fetch('../public/networks.json');
            if (networksResponse.ok) {
                const networksData = await networksResponse.json();
                this.networks = networksData.networks || [];
            }

            // Load mock user data
            this.loadMockData();
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadMockData();
        }
    }

    loadMockData() {
        // Mock users data
        this.users = [
            {
                deviceId: 'device_abc123',
                balance: 25.50,
                offersCompleted: 3,
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                deviceId: 'device_def456',
                balance: 15.00,
                offersCompleted: 2,
                lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                deviceId: 'device_ghi789',
                balance: 42.75,
                offersCompleted: 5,
                lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                joinDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Mock analytics data
        this.analytics = {
            totalClicks: 1247,
            totalConversions: 89,
            totalRevenue: 2156.75,
            mobileTraffic: 68,
            topOffers: [
                { title: 'HelloFresh AU — First Box', clicks: 156, conversions: 23, revenue: 575.00 },
                { title: 'Fyber Game — Level 10', clicks: 134, conversions: 18, revenue: 144.00 },
                { title: 'Swagbucks AU — Survey Pack', clicks: 98, conversions: 15, revenue: 90.00 }
            ]
        };
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Add offer form
        const newOfferForm = document.getElementById('newOfferForm');
        if (newOfferForm) {
            newOfferForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddOffer();
            });

            // Category change handler for subcategories
            const categorySelect = newOfferForm.querySelector('select[name="category"]');
            if (categorySelect) {
                categorySelect.addEventListener('change', (e) => {
                    this.updateSubcategories(e.target.value);
                });
            }
        }

        // Add network form
        const newNetworkForm = document.getElementById('newNetworkForm');
        if (newNetworkForm) {
            newNetworkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddNetwork();
            });
        }

        // Auto-refresh data every 30 seconds
        setInterval(() => {
            if (this.isAuthenticated) {
                this.refreshDashboard();
            }
        }, 30000);
    }

    // Authentication
    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.currentCaptcha = captcha;
        const captchaDisplay = document.getElementById('captchaDisplay');
        if (captchaDisplay) {
            captchaDisplay.textContent = captcha;
        }
    }

    handleLogin() {
        const adminKey = document.getElementById('adminKey').value;
        const captchaInput = document.getElementById('captchaInput').value;
        const errorMessage = document.getElementById('errorMessage');

        // Clear previous errors
        errorMessage.style.display = 'none';

        // Validate captcha - use window.currentCaptcha from inline script
        const expectedCaptcha = window.currentCaptcha || this.currentCaptcha || '';
        if (!captchaInput || captchaInput.toLowerCase() !== expectedCaptcha.toLowerCase()) {
            this.showError('Invalid captcha. Please try again.');
            // Generate new captcha on failed attempt
            if (window.generateCaptcha) {
                window.generateCaptcha();
            } else {
                this.generateCaptcha();
            }
            document.getElementById('captchaInput').value = '';
            return;
        }

        // Validate admin key using security module
        if (window.security) {
            const result = window.security.validateAdminAccess(adminKey);
            if (!result.success) {
                this.showError(result.message);
                // Generate new captcha on failed attempt
                if (window.generateCaptcha) {
                    window.generateCaptcha();
                } else {
                    this.generateCaptcha();
                }
                document.getElementById('captchaInput').value = '';
                return;
            }
        } else {
            // Fallback validation
            if (adminKey !== this.settings.adminKey) {
                this.showError('Invalid admin key');
                // Generate new captcha on failed attempt
                if (window.generateCaptcha) {
                    window.generateCaptcha();
                } else {
                    this.generateCaptcha();
                }
                document.getElementById('captchaInput').value = '';
                return;
            }
        }

        // Successful login
        this.isAuthenticated = true;
        sessionStorage.setItem('perkpocket_admin_session', 'authenticated');
        this.showDashboard();
        this.showNotification('Successfully logged in', 'success');
    }

    checkAuthentication() {
        const session = sessionStorage.getItem('perkpocket_admin_session');
        if (session === 'authenticated') {
            this.isAuthenticated = true;
            this.showDashboard();
        }
    }

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminDashboard').classList.add('active');
        this.refreshDashboard();
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    // Tab Management
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.refreshTabContent(tabName);
    }

    refreshTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateOverview();
                break;
            case 'offers':
                this.updateOffersTable();
                break;
            case 'networks':
                this.updateNetworksGrid();
                break;
            case 'users':
                this.updateUsersTable();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'settings':
                this.updateSettings();
                break;
        }
    }

    refreshDashboard() {
        this.refreshTabContent(this.currentTab);
    }

    // Overview Tab
    updateOverview() {
        // Update stats
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalOffers').textContent = this.offers.length;
        
        const totalPayouts = this.users.reduce((sum, user) => sum + user.balance, 0);
        document.getElementById('totalPayouts').textContent = `$${totalPayouts.toFixed(2)}`;
        
        const conversionRate = this.analytics.totalClicks > 0 ? 
            ((this.analytics.totalConversions / this.analytics.totalClicks) * 100).toFixed(1) : '0';
        document.getElementById('conversionRate').textContent = `${conversionRate}%`;

        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const tbody = document.getElementById('recentActivity');
        if (!tbody) return;

        // Mock recent activity data
        const activities = [
            {
                time: '2 min ago',
                user: 'device_abc123',
                action: 'Completed HelloFresh AU offer',
                amount: '$25.00'
            },
            {
                time: '15 min ago',
                user: 'device_def456',
                action: 'Clicked Fyber Game offer',
                amount: '-'
            },
            {
                time: '1 hour ago',
                user: 'device_ghi789',
                action: 'Requested cashout',
                amount: '$42.75'
            }
        ];

        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.time}</td>
                <td>${activity.user}</td>
                <td>${activity.action}</td>
                <td>${activity.amount}</td>
            </tr>
        `).join('');
    }

    // Offers Management
    updateOffersTable() {
        const tbody = document.getElementById('offersTable');
        if (!tbody) return;

        if (this.offers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #b0b0b0;">No offers found</td></tr>';
            return;
        }

        tbody.innerHTML = this.offers.map(offer => `
            <tr>
                <td>${offer.title}</td>
                <td>${offer.market}</td>
                <td>${this.formatCategory(offer.category)}</td>
                <td>$${offer.payout.toFixed(2)}</td>
                <td>${offer.network || 'N/A'}</td>
                <td>
                    <button class="btn-link" onclick="admin.editOffer('${offer.id}')">Edit</button>
                    <button class="btn-link" onclick="admin.deleteOffer('${offer.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    formatCategory(category) {
        const categoryMap = {
            meal_kits: 'Meal Kits',
            app_installs: 'App Installs',
            freebies: 'Freebies',
            groceries_fuel: 'Groceries & Fuel'
        };
        return categoryMap[category] || category;
    }

    showAddOfferForm() {
        const form = document.getElementById('addOfferForm');
        if (form) {
            form.style.display = 'block';
            this.populateNetworkOptions();
        }
    }

    hideAddOfferForm() {
        const form = document.getElementById('addOfferForm');
        if (form) {
            form.style.display = 'none';
            document.getElementById('newOfferForm').reset();
        }
    }

    updateSubcategories(category) {
        const subcategorySelect = document.querySelector('select[name="subcategory"]');
        if (!subcategorySelect) return;

        const subcategoryMap = {
            meal_kits: [
                { value: 'premium_kits', text: 'Premium Kits' },
                { value: 'budget_kits', text: 'Budget Kits' },
                { value: 'specialty_diets', text: 'Specialty Diets' }
            ],
            app_installs: [
                { value: 'gaming_apps', text: 'Gaming Apps' },
                { value: 'utility_apps', text: 'Utility Apps' }
            ],
            freebies: [
                { value: 'samples', text: 'Samples' },
                { value: 'surveys', text: 'Surveys' },
                { value: 'trials', text: 'Trials' }
            ],
            groceries_fuel: [
                { value: 'supermarkets', text: 'Supermarkets' },
                { value: 'fuel_stations', text: 'Fuel Stations' }
            ]
        };

        const subcategories = subcategoryMap[category] || [];
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>' +
            subcategories.map(sub => `<option value="${sub.value}">${sub.text}</option>`).join('');
    }

    populateNetworkOptions() {
        const networkSelect = document.querySelector('select[name="network"]');
        if (!networkSelect) return;

        networkSelect.innerHTML = '<option value="">Select Network</option>' +
            this.networks.map(network => `<option value="${network.id}">${network.name}</option>`).join('');
    }

    handleAddOffer() {
        const form = document.getElementById('newOfferForm');
        const formData = new FormData(form);
        
        const newOffer = {
            id: 'offer_' + Date.now(),
            title: formData.get('title'),
            market: formData.get('market'),
            category: formData.get('category'),
            subcategory: formData.get('subcategory'),
            payout: parseFloat(formData.get('payout')),
            network: formData.get('network'),
            description: formData.get('description'),
            url: formData.get('url'),
            featured: formData.has('featured'),
            requirements: 'New customers only',
            timeframe: '7 days to complete'
        };

        this.offers.push(newOffer);
        this.saveOffers();
        this.updateOffersTable();
        this.hideAddOfferForm();
        this.showNotification('Offer added successfully', 'success');
    }

    editOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (!offer) return;

        // For demo purposes, just show an alert
        // In a real implementation, you'd populate a form with the offer data
        const newTitle = prompt('Edit offer title:', offer.title);
        if (newTitle && newTitle !== offer.title) {
            offer.title = newTitle;
            this.saveOffers();
            this.updateOffersTable();
            this.showNotification('Offer updated successfully', 'success');
        }
    }

    deleteOffer(offerId) {
        if (confirm('Are you sure you want to delete this offer?')) {
            this.offers = this.offers.filter(o => o.id !== offerId);
            this.saveOffers();
            this.updateOffersTable();
            this.showNotification('Offer deleted successfully', 'success');
        }
    }

    saveOffers() {
        // In a real implementation, this would save to a backend
        localStorage.setItem('perkpocket_admin_offers', JSON.stringify(this.offers));
    }

    refreshOffers() {
        this.showNotification('Offers refreshed', 'info');
        this.updateOffersTable();
    }

    // Networks Management
    updateNetworksGrid() {
        const grid = document.getElementById('networksGrid');
        if (!grid) return;

        if (this.networks.length === 0) {
            grid.innerHTML = '<div style="text-align: center; color: #b0b0b0; grid-column: 1/-1;">No networks found</div>';
            return;
        }

        grid.innerHTML = this.networks.map(network => `
            <div class="network-card">
                <div class="network-header">
                    <div>
                        <div class="network-name">${network.name}</div>
                        <div class="network-category">${this.formatCategory(network.category)}</div>
                    </div>
                    <div class="network-status ${this.getStatusClass(network.status)}">${network.status || 'active'}</div>
                </div>
                <div class="network-info">
                    <div class="network-detail">
                        <span class="network-detail-label">Commission:</span>
                        <span class="network-detail-value">${network.commission}</span>
                    </div>
                    <div class="network-detail">
                        <span class="network-detail-label">Cookie Duration:</span>
                        <span class="network-detail-value">${network.cookie_duration}</span>
                    </div>
                    <div class="network-detail">
                        <span class="network-detail-label">Payment Terms:</span>
                        <span class="network-detail-value">${network.payment_terms}</span>
                    </div>
                    <div class="network-detail">
                        <span class="network-detail-label">Markets:</span>
                        <span class="network-detail-value">${Array.isArray(network.markets) ? network.markets.join(', ') : network.markets}</span>
                    </div>
                </div>
                <div class="network-actions">
                    <a href="${network.signup_url}" target="_blank" class="btn-link">Sign Up</a>
                    <button class="btn-link" onclick="admin.editNetwork('${network.id}')">Edit</button>
                    <button class="btn-link" onclick="admin.deleteNetwork('${network.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    getStatusClass(status) {
        switch (status) {
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'inactive': return 'status-inactive';
            default: return 'status-active';
        }
    }

    showAddNetworkForm() {
        const form = document.getElementById('addNetworkForm');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideAddNetworkForm() {
        const form = document.getElementById('addNetworkForm');
        if (form) {
            form.style.display = 'none';
            document.getElementById('newNetworkForm').reset();
        }
    }

    handleAddNetwork() {
        const form = document.getElementById('newNetworkForm');
        const formData = new FormData(form);
        
        const newNetwork = {
            id: 'network_' + Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            commission: formData.get('commission'),
            cookie_duration: formData.get('cookie_duration'),
            payment_terms: formData.get('payment_terms'),
            signup_url: formData.get('signup_url'),
            description: formData.get('description'),
            requirements: formData.get('requirements'),
            markets: ['Global'],
            status: 'active'
        };

        this.networks.push(newNetwork);
        this.saveNetworks();
        this.updateNetworksGrid();
        this.hideAddNetworkForm();
        this.showNotification('Network added successfully', 'success');
    }

    editNetwork(networkId) {
        const network = this.networks.find(n => n.id === networkId);
        if (!network) return;

        const newName = prompt('Edit network name:', network.name);
        if (newName && newName !== network.name) {
            network.name = newName;
            this.saveNetworks();
            this.updateNetworksGrid();
            this.showNotification('Network updated successfully', 'success');
        }
    }

    deleteNetwork(networkId) {
        if (confirm('Are you sure you want to delete this network?')) {
            this.networks = this.networks.filter(n => n.id !== networkId);
            this.saveNetworks();
            this.updateNetworksGrid();
            this.showNotification('Network deleted successfully', 'success');
        }
    }

    saveNetworks() {
        localStorage.setItem('perkpocket_admin_networks', JSON.stringify(this.networks));
    }

    refreshNetworks() {
        this.showNotification('Networks refreshed', 'info');
        this.updateNetworksGrid();
    }

    // Users Management
    updateUsersTable() {
        const tbody = document.getElementById('usersTable');
        if (!tbody) return;

        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #b0b0b0;">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.deviceId}</td>
                <td>$${user.balance.toFixed(2)}</td>
                <td>${user.offersCompleted}</td>
                <td>${this.formatDate(user.lastActivity)}</td>
                <td>
                    <button class="btn-link" onclick="admin.viewUser('${user.deviceId}')">View</button>
                    <button class="btn-link" onclick="admin.adjustBalance('${user.deviceId}')">Adjust Balance</button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
    }

    viewUser(deviceId) {
        const user = this.users.find(u => u.deviceId === deviceId);
        if (!user) return;

        alert(`User Details:\nDevice ID: ${user.deviceId}\nBalance: $${user.balance.toFixed(2)}\nOffers Completed: ${user.offersCompleted}\nJoin Date: ${new Date(user.joinDate).toLocaleDateString()}\nLast Activity: ${this.formatDate(user.lastActivity)}`);
    }

    adjustBalance(deviceId) {
        const user = this.users.find(u => u.deviceId === deviceId);
        if (!user) return;

        const adjustment = prompt(`Current balance: $${user.balance.toFixed(2)}\nEnter adjustment amount (use negative for deduction):`);
        if (adjustment !== null && !isNaN(adjustment)) {
            const amount = parseFloat(adjustment);
            user.balance += amount;
            this.saveUsers();
            this.updateUsersTable();
            this.showNotification(`Balance adjusted by $${amount.toFixed(2)}`, 'success');
        }
    }

    saveUsers() {
        localStorage.setItem('perkpocket_admin_users', JSON.stringify(this.users));
    }

    refreshUsers() {
        this.showNotification('Users refreshed', 'info');
        this.updateUsersTable();
    }

    exportUsers() {
        const csvContent = 'Device ID,Balance,Offers Completed,Last Activity,Join Date\n' +
            this.users.map(user => 
                `${user.deviceId},$${user.balance.toFixed(2)},${user.offersCompleted},${user.lastActivity},${user.joinDate}`
            ).join('\n');

        this.downloadCSV(csvContent, 'perkpocket_users.csv');
        this.showNotification('Users exported successfully', 'success');
    }

    // Analytics
    updateAnalytics() {
        document.getElementById('totalClicks').textContent = this.analytics.totalClicks;
        document.getElementById('totalConversions').textContent = this.analytics.totalConversions;
        document.getElementById('totalRevenue').textContent = `$${this.analytics.totalRevenue.toFixed(2)}`;
        document.getElementById('mobileTraffic').textContent = `${this.analytics.mobileTraffic}%`;

        this.updateAnalyticsTable();
    }

    updateAnalyticsTable() {
        const tbody = document.getElementById('analyticsTable');
        if (!tbody) return;

        if (!this.analytics.topOffers || this.analytics.topOffers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #b0b0b0;">No analytics data available</td></tr>';
            return;
        }

        tbody.innerHTML = this.analytics.topOffers.map(offer => {
            const conversionRate = offer.clicks > 0 ? ((offer.conversions / offer.clicks) * 100).toFixed(1) : '0';
            return `
                <tr>
                    <td>${offer.title}</td>
                    <td>${offer.clicks}</td>
                    <td>${offer.conversions}</td>
                    <td>${conversionRate}%</td>
                    <td>$${offer.revenue.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }

    exportAnalytics() {
        const csvContent = 'Offer,Clicks,Conversions,Conversion Rate,Revenue\n' +
            this.analytics.topOffers.map(offer => {
                const conversionRate = offer.clicks > 0 ? ((offer.conversions / offer.clicks) * 100).toFixed(1) : '0';
                return `${offer.title},${offer.clicks},${offer.conversions},${conversionRate}%,$${offer.revenue.toFixed(2)}`;
            }).join('\n');

        this.downloadCSV(csvContent, 'perkpocket_analytics.csv');
        this.showNotification('Analytics exported successfully', 'success');
    }

    // Settings
    updateSettings() {
        document.getElementById('platformName').value = this.settings.platformName;
        document.getElementById('minCashout').value = this.settings.minCashout;
        document.getElementById('referralBonus').value = this.settings.referralBonus;
        this.updateSecurityEvents();
    }

    saveSettings() {
        this.settings.platformName = document.getElementById('platformName').value;
        this.settings.minCashout = parseFloat(document.getElementById('minCashout').value);
        this.settings.referralBonus = parseFloat(document.getElementById('referralBonus').value);
        
        localStorage.setItem('perkpocket_admin_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully', 'success');
    }

    changeAdminKey() {
        const newKey = document.getElementById('newAdminKey').value;
        const confirmKey = document.getElementById('confirmAdminKey').value;

        if (!newKey || newKey.length < 10) {
            this.showNotification('Admin key must be at least 10 characters long', 'error');
            return;
        }

        if (newKey !== confirmKey) {
            this.showNotification('Admin keys do not match', 'error');
            return;
        }

        this.settings.adminKey = newKey;
        localStorage.setItem('perkpocket_admin_settings', JSON.stringify(this.settings));
        
        // Clear form
        document.getElementById('newAdminKey').value = '';
        document.getElementById('confirmAdminKey').value = '';
        
        this.showNotification('Admin key updated successfully', 'success');
    }

    updateSecurityEvents() {
        const tbody = document.getElementById('securityEvents');
        if (!tbody) return;

        // Get security events from security module
        let events = [];
        if (window.security && window.security.securityState) {
            events = window.security.securityState.securityEvents.slice(-10).reverse();
        }

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #b0b0b0;">No security events</td></tr>';
            return;
        }

        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${this.formatDate(event.timestamp)}</td>
                <td>${event.type.replace(/_/g, ' ').toUpperCase()}</td>
                <td>${JSON.stringify(event.data || {})}</td>
            </tr>
        `).join('');
    }

    clearSecurityLogs() {
        if (confirm('Are you sure you want to clear all security logs?')) {
            if (window.security) {
                window.security.clearSecurityData();
            }
            this.updateSecurityEvents();
            this.showNotification('Security logs cleared', 'success');
        }
    }

    // Utility Methods
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for HTML onclick events
function showTab(tabName) {
    admin.showTab(tabName);
}

function refreshCaptcha() {
    admin.generateCaptcha();
}

function showAddOfferForm() {
    admin.showAddOfferForm();
}

function hideAddOfferForm() {
    admin.hideAddOfferForm();
}

function showAddNetworkForm() {
    admin.showAddNetworkForm();
}

function hideAddNetworkForm() {
    admin.hideAddNetworkForm();
}

function refreshOffers() {
    admin.refreshOffers();
}

function refreshNetworks() {
    admin.refreshNetworks();
}

function refreshUsers() {
    admin.refreshUsers();
}

function exportUsers() {
    admin.exportUsers();
}

function exportAnalytics() {
    admin.exportAnalytics();
}

function saveSettings() {
    admin.saveSettings();
}

function changeAdminKey() {
    admin.changeAdminKey();
}

function clearSecurityLogs() {
    admin.clearSecurityLogs();
}

// Initialize admin console when DOM is loaded
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new PerkPocketAdmin();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkPocketAdmin;
}
