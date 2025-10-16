// PerkPocket Chatbot
class PerkPocketChatbot {
    constructor() {
        this.responses = {
            greetings: [
                "Hi! I'm here to help you navigate PerkPocket. What would you like to know?",
                "Hello! Welcome to PerkPocket. How can I assist you today?",
                "Hey there! I'm your PerkPocket assistant. What questions do you have?"
            ],
            
            howItWorks: [
                "PerkPocket is simple! Choose your market (AU/UK), browse categories, complete offers, and earn cash. You can cash out once you reach $10.",
                "Here's how it works: 1) Select Australia or UK 2) Pick a category like Meal Kits or App Installs 3) Complete offers 4) Earn money 5) Cash out when you reach $10!"
            ],
            
            markets: [
                "We currently support Australia (AU) and United Kingdom (UK) markets. Each market has offers specifically available in that region.",
                "You can choose between Australia and UK markets. The offers are tailored to each region with local brands and services."
            ],
            
            categories: [
                "We have 4 main categories: 🍽️ Meal Kits (recipe boxes), 📱 App Installs (games & utilities), 🎁 Freebies (samples & surveys), and ⛽ Groceries & Fuel (shopping rewards).",
                "Our categories include Meal Kits for food delivery, App Installs for mobile games, Freebies for samples and surveys, and Groceries & Fuel for shopping rewards."
            ],
            
            cashout: [
                "You can cash out once you reach $10. We support PayPal, bank transfer, and gift cards. Payouts are processed within 3-5 business days.",
                "Minimum cashout is $10. Choose from PayPal, bank transfer, or gift cards. Processing takes 3-5 business days after approval."
            ],
            
            referrals: [
                "Earn $5 for each friend who joins and completes their first offer! Share your referral link and start earning from referrals.",
                "Our referral program gives you $5 per friend who signs up and completes an offer. It's a great way to boost your earnings!"
            ],
            
            offers: [
                "Offers vary by market and category. Payouts range from $3-25 depending on the complexity. All offers have clear requirements and timeframes.",
                "We have offers ranging from $3 to $25. Each offer shows the payout amount, requirements, and how long you have to complete it."
            ],
            
            support: [
                "If you need help with a specific offer or payout, you can contact our support team. For technical issues, try refreshing the page or clearing your browser cache.",
                "For account issues, check your activity history first. If you still need help, our support team is available to assist with offer completions and payouts."
            ],
            
            safety: [
                "All our offers are from verified affiliate networks and trusted brands. We never ask for sensitive information like passwords or credit card details.",
                "Your safety is important! We only work with legitimate affiliate networks. Never share personal financial information through offer completions."
            ],
            
            default: [
                "I'm not sure about that specific question. Try asking about how PerkPocket works, available markets, categories, cashouts, or referrals.",
                "That's a great question! I can help with information about offers, markets, categories, cashouts, referrals, and how PerkPocket works.",
                "I'd love to help! Ask me about markets (AU/UK), offer categories, how to cash out, referral earnings, or how PerkPocket works."
            ]
        };
        
        this.keywords = {
            greetings: ['hi', 'hello', 'hey', 'start', 'begin'],
            howItWorks: ['how', 'work', 'works', 'start', 'begin', 'guide', 'tutorial'],
            markets: ['market', 'country', 'australia', 'uk', 'britain', 'region', 'location'],
            categories: ['category', 'categories', 'meal', 'app', 'freebie', 'grocery', 'fuel', 'type'],
            cashout: ['cash', 'payout', 'withdraw', 'money', 'payment', 'minimum', '$10'],
            referrals: ['refer', 'referral', 'friend', 'invite', 'share', '$5'],
            offers: ['offer', 'offers', 'deal', 'deals', 'earn', 'complete', 'payout'],
            support: ['help', 'support', 'problem', 'issue', 'contact', 'stuck'],
            safety: ['safe', 'safety', 'secure', 'trust', 'legitimate', 'scam']
        };
        
        this.conversationHistory = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.addBotMessage(this.getRandomResponse('greetings'));
    }
    
    setupEventListeners() {
        const chatInput = document.getElementById('chatbotInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleUserInput();
                }
            });
        }
    }
    
    handleUserInput() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addUserMessage(message);
        
        // Clear input
        input.value = '';
        
        // Process and respond
        setTimeout(() => {
            const response = this.processMessage(message);
            this.addBotMessage(response);
        }, 500);
    }
    
    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for keywords
        for (const [category, keywords] of Object.entries(this.keywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return this.getRandomResponse(category);
            }
        }
        
        // Check for specific questions
        if (lowerMessage.includes('balance') || lowerMessage.includes('earned')) {
            return `Your current balance is $${app?.userBalance?.toFixed(2) || '0.00'}. Keep completing offers to reach your goal!`;
        }
        
        if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
            const remaining = (app?.userGoal || 100) - (app?.userBalance || 0);
            return `You're $${remaining.toFixed(2)} away from your $${app?.userGoal || 100} goal. You're doing great!`;
        }
        
        if (lowerMessage.includes('history') || lowerMessage.includes('activity')) {
            const historyCount = app?.activityHistory?.length || 0;
            return `You've completed ${historyCount} offers so far. Check your activity history below the offers section!`;
        }
        
        // Default response
        return this.getRandomResponse('default');
    }
    
    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addUserMessage(message) {
        this.addMessage(message, 'user');
        this.conversationHistory.push({ type: 'user', message, timestamp: new Date() });
    }
    
    addBotMessage(message) {
        this.addMessage(message, 'bot');
        this.conversationHistory.push({ type: 'bot', message, timestamp: new Date() });
    }
    
    addMessage(message, type) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        const messageText = document.createElement('span');
        messageText.className = 'message-text';
        messageText.textContent = message;
        
        messageElement.appendChild(messageText);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Quick action methods
    explainHowItWorks() {
        this.addBotMessage(this.getRandomResponse('howItWorks'));
    }
    
    showMarkets() {
        this.addBotMessage(this.getRandomResponse('markets'));
    }
    
    showCategories() {
        this.addBotMessage(this.getRandomResponse('categories'));
    }
    
    explainCashout() {
        this.addBotMessage(this.getRandomResponse('cashout'));
    }
    
    explainReferrals() {
        this.addBotMessage(this.getRandomResponse('referrals'));
    }
}

// Global function for sending chat messages
function sendChatMessage() {
    if (window.chatbot) {
        window.chatbot.handleUserInput();
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new PerkPocketChatbot();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkPocketChatbot;
}

