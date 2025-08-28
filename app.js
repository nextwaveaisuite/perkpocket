// PerkPocket Main Application with Security Integration
class PerkPocketApp {
    constructor() {
        this.currentMarket = null;
        this.currentCategory = null;
        this.offers = this.loadOffers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showMarketSelection();
    }

    setupEventListeners() {
        // Market selection
        document.querySelectorAll('.market-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const market = e.currentTarget.dataset.market;
                this.selectMarket(market);
            });
        });

        // Category selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.selectCategory(category);
            });
        });

        // Offer clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('offer-cta')) {
                const offerCard = e.target.closest('.offer-card');
                const offerId = offerCard.dataset.offer;
                this.handleOfferClick(offerId);
            }
        });
    }

    selectMarket(market) {
        // Security validation
        if (!window.securityManager.validateUserAction('market_select')) {
            return;
        }

        if (!window.securityManager.checkRateLimit('market_select')) {
            return;
        }

        this.currentMarket = market;
        this.showCategories();

        // Log market selection
        window.securityManager.logSecurityEvent('market_selected', { market });
    }

    selectCategory(category) {
        // Security validation
        if (!window.securityManager.validateUserAction('category_select')) {
            return;
        }

        if (!window.securityManager.checkRateLimit('category_select')) {
            return;
        }

        this.currentCategory = category;
        this.showOffers();

        // Log category selection
        window.securityManager.logSecurityEvent('category_selected', { 
            market: this.currentMarket, 
            category 
        });
    }

    handleOfferClick(offerId) {
        // Security validation
        if (!window.securityManager.validateUserAction('offer_click')) {
            return;
        }

        if (!window.securityManager.checkRateLimit('offer_click')) {
            return;
        }

        const offer = this.findOffer(offerId);
        if (!offer) return;

        // Show confirmation modal
        this.showOfferConfirmation(offer);

        // Log offer click
        window.securityManager.logSecurityEvent('offer_clicked', { 
            offerId,
            market: this.currentMarket,
            category: this.currentCategory,
            amount: offer.amount
        });
    }

    showOfferConfirmation(offer) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🎯 Confirm Offer</h3>
                <p><strong>${offer.title}</strong></p>
                <p>Earn: <span style="color: #48bb78; font-weight: bold;">${offer.amount}</span></p>
                <p>${offer.description}</p>
                <div style="margin-top: 20px;">
                    <button id="confirm-offer" style="background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                        Continue to Offer
                    </button>
                    <button id="cancel-offer" class="skip-btn">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Event listeners
        document.getElementById('confirm-offer').addEventListener('click', () => {
            this.redirectToOffer(offer);
            modal.remove();
        });

        document.getElementById('cancel-offer').addEventListener('click', () => {
            modal.remove();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    redirectToOffer(offer) {
        // In production, this would redirect to the actual affiliate link
        window.securityManager.showNotification(
            `🚀 Redirecting to ${offer.title}. Complete the offer to earn ${offer.amount}!`, 
            'success'
        );

        // Log successful redirect
        window.securityManager.logSecurityEvent('offer_redirect', { 
            offerId: offer.id,
            url: offer.url
        });

        // Simulate redirect (in production, use: window.open(offer.url, '_blank'))
        setTimeout(() => {
            window.securityManager.showNotification(
                '✅ Offer completed! Your cashback will be tracked automatically.', 
                'success'
            );
        }, 3000);
    }

    showMarketSelection() {
        document.querySelector('.welcome-section').style.display = 'block';
        document.querySelector('.categories-section').style.display = 'none';
        document.querySelector('.offers-section').style.display = 'none';
    }

    showCategories() {
        document.querySelector('.welcome-section').style.display = 'none';
        document.querySelector('.categories-section').style.display = 'block';
        document.querySelector('.offers-section').style.display = 'none';

        // Update market title
        const marketName = this.currentMarket === 'au' ? '🇦🇺 Australia' : '🇬🇧 United Kingdom';
        document.getElementById('market-title').textContent = `${marketName} - Categories`;

        // Update offer counts
        this.updateOfferCounts();
    }

    showOffers() {
        document.querySelector('.welcome-section').style.display = 'none';
        document.querySelector('.categories-section').style.display = 'none';
        document.querySelector('.offers-section').style.display = 'block';

        // Update offers title
        const categoryName = this.getCategoryDisplayName(this.currentCategory);
        const marketName = this.currentMarket === 'au' ? 'Australia' : 'United Kingdom';
        document.getElementById('offers-title').textContent = `${categoryName} - ${marketName}`;

        // Load offers
        this.loadOffersForCategory();
    }

    updateOfferCounts() {
        const categories = ['meal-kits', 'app-installs', 'freebies', 'groceries'];
        categories.forEach(category => {
            const card = document.querySelector(`[data-category="${category}"]`);
            if (card) {
                const count = this.getOfferCount(this.currentMarket, category);
                const countElement = card.querySelector('.offer-count');
                if (countElement) {
                    countElement.textContent = `${count} offers`;
                }
            }
        });
    }

    loadOffersForCategory() {
        const container = document.getElementById('offers-container');
        const offers = this.getOffersForCategory(this.currentMarket, this.currentCategory);
        
        container.innerHTML = '';
        
        offers.forEach(offer => {
            const offerCard = this.createOfferCard(offer);
            container.appendChild(offerCard);
        });
    }

    createOfferCard(offer) {
        const card = document.createElement('div');
        card.className = 'offer-card';
        card.dataset.offer = offer.id;
        
        card.innerHTML = `
            <div class="offer-header">
                <div>
                    <div class="offer-title">${offer.title}</div>
                    <div class="offer-amount">${offer.amount}</div>
                </div>
            </div>
            <div class="offer-description">${offer.description}</div>
            <button class="offer-cta">Earn ${offer.amount}</button>
        `;
        
        return card;
    }

    getCategoryDisplayName(category) {
        const names = {
            'meal-kits': 'Meal Kits',
            'app-installs': 'App Installs',
            'freebies': 'Freebies',
            'groceries': 'Groceries & Fuel'
        };
        return names[category] || category;
    }

    getOfferCount(market, category) {
        return this.offers[market]?.[category]?.length || 0;
    }

    getOffersForCategory(market, category) {
        return this.offers[market]?.[category] || [];
    }

    findOffer(offerId) {
        for (const market in this.offers) {
            for (const category in this.offers[market]) {
                const offer = this.offers[market][category].find(o => o.id === offerId);
                if (offer) return offer;
            }
        }
        return null;
    }

    loadOffers() {
        return {
            au: {
                'meal-kits': [
                    { id: 'hellofresh-au', title: 'HelloFresh AU — First Box', amount: '$25.00', description: 'First box signup. New users only. Premium meal kit service.', url: 'https://hellofresh.com.au' },
                    { id: 'marley-spoon-au', title: 'Marley Spoon AU', amount: '$20.00', description: 'Fresh ingredients delivered weekly. Chef-designed recipes.', url: 'https://marleyspoon.com.au' },
                    { id: 'dinnerly-au', title: 'Dinnerly AU', amount: '$15.00', description: 'Budget-friendly meal kits. Simple recipes, fresh ingredients.', url: 'https://dinnerly.com.au' },
                    { id: 'youfoodz-au', title: 'Youfoodz AU', amount: '$18.00', description: 'Ready-made healthy meals delivered fresh. No cooking required.', url: 'https://youfoodz.com' },
                    { id: 'freshly-au', title: 'Freshly AU', amount: '$22.00', description: 'Chef-prepared meals delivered fresh. Gluten-free options available.', url: 'https://freshly.com.au' },
                    { id: 'lite-n-easy-au', title: 'Lite n Easy AU', amount: '$16.00', description: 'Weight loss meal plans. Nutritionist approved meals.', url: 'https://liteneasy.com.au' },
                    { id: 'muscle-chef-au', title: 'My Muscle Chef AU', amount: '$19.00', description: 'High-protein meals for fitness enthusiasts. Macro-friendly options.', url: 'https://mymusclechef.com' },
                    { id: 'soulara-au', title: 'Soulara AU', amount: '$21.00', description: 'Plant-based meal delivery. 100% vegan and organic options.', url: 'https://soulara.com.au' }
                ],
                'app-installs': [
                    { id: 'adgem-au', title: 'AdGem AU', amount: '$3.50', description: 'Download and play mobile games. Earn rewards for app installs.', url: 'https://adgem.com' },
                    { id: 'fyber-au', title: 'Fyber AU', amount: '$2.80', description: 'Install apps and earn rewards. Mobile advertising platform.', url: 'https://fyber.com' },
                    { id: 'tapjoy-au', title: 'TapJoy AU', amount: '$4.20', description: 'Mobile app rewards platform. Complete offers and earn.', url: 'https://tapjoy.com' },
                    { id: 'ironsource-au', title: 'ironSource AU', amount: '$3.10', description: 'Download apps and games. Mobile monetization platform.', url: 'https://ironsrc.com' },
                    { id: 'unity-ads-au', title: 'Unity Ads AU', amount: '$2.90', description: 'Gaming app installs. Earn rewards for playing games.', url: 'https://unity.com' },
                    { id: 'applovin-au', title: 'AppLovin AU', amount: '$3.70', description: 'Mobile app discovery platform. Install and earn rewards.', url: 'https://applovin.com' },
                    { id: 'vungle-au', title: 'Vungle AU', amount: '$3.30', description: 'Video ad platform. Watch ads and install apps for rewards.', url: 'https://vungle.com' },
                    { id: 'chartboost-au', title: 'Chartboost AU', amount: '$2.60', description: 'Mobile game advertising. Install games and earn cashback.', url: 'https://chartboost.com' }
                ],
                'freebies': [
                    { id: 'swagbucks-au', title: 'Swagbucks AU', amount: '$5.00', description: 'Earn points for surveys and tasks. Redeem for cash or gift cards.', url: 'https://swagbucks.com.au' },
                    { id: 'prizerebel-au', title: 'PrizeRebel AU', amount: '$4.50', description: 'Complete surveys and offers. Earn points for rewards.', url: 'https://prizerebel.com' },
                    { id: 'yougov-au', title: 'YouGov AU', amount: '$3.80', description: 'Share your opinion through surveys. Influence brands and earn.', url: 'https://yougov.com.au' },
                    { id: 'toluna-au', title: 'Toluna AU', amount: '$4.20', description: 'Voice your opinion and earn rewards. Survey community platform.', url: 'https://toluna.com' },
                    { id: 'octopus-au', title: 'Octopus Group AU', amount: '$3.60', description: 'Market research surveys. Share opinions and earn cash.', url: 'https://octopusgroup.com.au' },
                    { id: 'pure-profile-au', title: 'Pure Profile AU', amount: '$4.10', description: 'Australian survey panel. Earn rewards for market research.', url: 'https://pureprofile.com' },
                    { id: 'valued-opinions-au', title: 'Valued Opinions AU', amount: '$3.90', description: 'Online surveys for cash. Share your views and get paid.', url: 'https://valuedopinions.com.au' },
                    { id: 'myopinions-au', title: 'MyOpinions AU', amount: '$3.70', description: 'Paid surveys and product testing. Earn rewards for feedback.', url: 'https://myopinions.com.au' }
                ],
                'groceries': [
                    { id: 'woolworths-au', title: 'Woolworths Rewards AU', amount: '$8.00', description: 'Cashback on grocery shopping. Earn points on every purchase.', url: 'https://woolworths.com.au' },
                    { id: 'coles-au', title: 'Coles AU', amount: '$7.50', description: 'Grocery rewards program. Earn flybuys points and discounts.', url: 'https://coles.com.au' },
                    { id: 'bp-au', title: 'BP Rewards AU', amount: '$6.50', description: 'Fuel rewards and cashback. Save on petrol and convenience items.', url: 'https://bp.com.au' },
                    { id: 'shell-au', title: 'Shell AU', amount: '$6.80', description: 'Fuel rewards program. Earn points on fuel and shop purchases.', url: 'https://shell.com.au' },
                    { id: 'iga-au', title: 'IGA AU', amount: '$5.90', description: 'Independent grocery rewards. Support local and earn cashback.', url: 'https://iga.com.au' },
                    { id: 'aldi-au', title: 'ALDI AU', amount: '$5.50', description: 'Special buys and grocery discounts. Quality products at low prices.', url: 'https://aldi.com.au' },
                    { id: 'costco-au', title: 'Costco AU', amount: '$7.20', description: 'Wholesale membership rewards. Bulk buying with cashback benefits.', url: 'https://costco.com.au' },
                    { id: 'caltex-au', title: 'Caltex AU', amount: '$6.30', description: 'Fuel and convenience rewards. Earn points on every fill-up.', url: 'https://caltex.com.au' }
                ]
            },
            uk: {
                'meal-kits': [
                    { id: 'hellofresh-uk', title: 'HelloFresh UK', amount: '£20.00', description: 'Fresh ingredients and recipes delivered. Premium meal kit service.', url: 'https://hellofresh.co.uk' },
                    { id: 'gousto-uk', title: 'Gousto UK', amount: '£15.00', description: 'Recipe boxes delivered to UK. Fresh ingredients and easy recipes.', url: 'https://gousto.co.uk' },
                    { id: 'mindful-chef-uk', title: 'Mindful Chef UK', amount: '£18.00', description: 'Healthy recipe boxes. Gluten-free and dairy-free options.', url: 'https://mindfulchef.com' },
                    { id: 'simply-cook-uk', title: 'Simply Cook UK', amount: '£12.00', description: 'Recipe kits with pre-measured ingredients. Quick and easy meals.', url: 'https://simplycook.com' },
                    { id: 'green-chef-uk', title: 'Green Chef UK', amount: '£22.00', description: 'Organic meal kits. Keto, paleo, and vegan options available.', url: 'https://greenchef.co.uk' },
                    { id: 'riverford-uk', title: 'Riverford UK', amount: '£16.00', description: 'Organic vegetable boxes. Fresh, seasonal produce delivered.', url: 'https://riverford.co.uk' },
                    { id: 'abel-cole-uk', title: 'Abel & Cole UK', amount: '£17.00', description: 'Organic food delivery. Sustainable and ethical produce.', url: 'https://abelandcole.co.uk' },
                    { id: 'fresh-fitness-uk', title: 'Fresh Fitness Food UK', amount: '£19.00', description: 'Healthy meal delivery. Macro-counted meals for fitness goals.', url: 'https://freshfitnessfood.com' }
                ],
                'app-installs': [
                    { id: 'tapjoy-uk', title: 'TapJoy UK', amount: '£2.50', description: 'Mobile app rewards platform. Complete offers and earn rewards.', url: 'https://tapjoy.com' },
                    { id: 'ironsource-uk', title: 'ironSource UK', amount: '£3.20', description: 'Download apps and games. Mobile monetization platform.', url: 'https://ironsrc.com' },
                    { id: 'fyber-uk', title: 'Fyber UK', amount: '£2.70', description: 'Install apps and earn rewards. Mobile advertising network.', url: 'https://fyber.com' },
                    { id: 'unity-ads-uk', title: 'Unity Ads UK', amount: '£2.90', description: 'Gaming app installs. Earn rewards for playing mobile games.', url: 'https://unity.com' },
                    { id: 'applovin-uk', title: 'AppLovin UK', amount: '£3.40', description: 'Mobile app discovery. Install apps and earn cashback rewards.', url: 'https://applovin.com' },
                    { id: 'vungle-uk', title: 'Vungle UK', amount: '£3.10', description: 'Video advertising platform. Watch ads and install for rewards.', url: 'https://vungle.com' },
                    { id: 'chartboost-uk', title: 'Chartboost UK', amount: '£2.80', description: 'Mobile game advertising. Install games and earn points.', url: 'https://chartboost.com' },
                    { id: 'admob-uk', title: 'AdMob UK', amount: '£2.60', description: 'Google mobile advertising. App installs with reward system.', url: 'https://admob.google.com' }
                ],
                'freebies': [
                    { id: 'swagbucks-uk', title: 'Swagbucks UK', amount: '£3.00', description: 'Earn rewards for online activities. Surveys, shopping, and more.', url: 'https://swagbucks.com/gb' },
                    { id: 'yougov-uk', title: 'YouGov UK', amount: '£4.20', description: 'Share your opinion through surveys. Influence UK brands and politics.', url: 'https://yougov.co.uk' },
                    { id: 'toluna-uk', title: 'Toluna UK', amount: '£3.80', description: 'Voice your opinion and earn rewards. UK survey community.', url: 'https://uk.toluna.com' },
                    { id: 'populus-uk', title: 'Populus Live UK', amount: '£3.50', description: 'Quick polls and surveys. Earn rewards for sharing opinions.', url: 'https://populuslive.com' },
                    { id: 'opinion-outpost-uk', title: 'Opinion Outpost UK', amount: '£3.90', description: 'Online surveys for cash. Share views and get paid instantly.', url: 'https://opinionoutpost.co.uk' },
                    { id: 'valued-opinions-uk', title: 'Valued Opinions UK', amount: '£4.10', description: 'Market research surveys. Earn vouchers for major UK retailers.', url: 'https://valuedopinions.co.uk' },
                    { id: 'pinecone-uk', title: 'Pinecone Research UK', amount: '£4.50', description: 'Exclusive survey panel. Product testing and market research.', url: 'https://pineconeresearch.co.uk' },
                    { id: 'ipsos-uk', title: 'Ipsos i-Say UK', amount: '£3.70', description: 'Global market research. Earn points for surveys and polls.', url: 'https://i-say.com/uk' }
                ],
                'groceries': [
                    { id: 'tesco-uk', title: 'Tesco Clubcard UK', amount: '£7.50', description: 'Grocery shopping rewards. Earn points on every Tesco purchase.', url: 'https://tesco.com' },
                    { id: 'sainsburys-uk', title: 'Sainsbury\'s UK', amount: '£6.80', description: 'Nectar points rewards. Earn on groceries and fuel purchases.', url: 'https://sainsburys.co.uk' },
                    { id: 'asda-uk', title: 'ASDA UK', amount: '£6.20', description: 'George rewards and cashback. Save on groceries and clothing.', url: 'https://asda.com' },
                    { id: 'morrisons-uk', title: 'Morrisons UK', amount: '£6.50', description: 'More card rewards. Earn points on fresh food and groceries.', url: 'https://morrisons.com' },
                    { id: 'shell-uk', title: 'Shell Rewards UK', amount: '£5.80', description: 'Fuel and convenience rewards. Earn points at Shell stations.', url: 'https://shell.co.uk' },
                    { id: 'bp-uk', title: 'BP UK', amount: '£6.10', description: 'BPme rewards app. Contactless fuel payment with cashback.', url: 'https://bp.com/uk' },
                    { id: 'esso-uk', title: 'Esso UK', amount: '£5.90', description: 'Esso Smiles rewards. Earn points on fuel and shop purchases.', url: 'https://esso.co.uk' },
                    { id: 'iceland-uk', title: 'Iceland UK', amount: '£5.50', description: 'Bonus card rewards. Frozen food specialist with cashback offers.', url: 'https://iceland.co.uk' }
                ]
            }
        };
    }
}

// Global navigation functions
function showMarketSelection() {
    window.perkPocketApp.showMarketSelection();
}

function showCategories() {
    window.perkPocketApp.showCategories();
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.perkPocketApp = new PerkPocketApp();
});

