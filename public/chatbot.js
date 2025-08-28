// Enhanced Chatbot with Security Integration
class PerkPocketChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadKnowledgeBase();
    }

    setupEventListeners() {
        const toggle = document.getElementById('chat-toggle');
        const close = document.getElementById('chat-close');
        const send = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }
        });
    }

    loadKnowledgeBase() {
        this.knowledgeBase = {
            offers: {
                keywords: ['offer', 'deal', 'cashback', 'reward', 'earn', 'money'],
                responses: [
                    "🎯 We have amazing offers across 4 categories:\n\n🍽️ **Meal Kits** - Up to $25 cashback\n📱 **App Installs** - $2-5 per app\n🎁 **Freebies** - Surveys & rewards\n⛽ **Groceries & Fuel** - Up to $8 cashback\n\nWhich category interests you most?",
                    "💰 Our top offers include:\n• HelloFresh AU - $25 cashback\n• Marley Spoon - $20 cashback\n• Swagbucks - $5 signup bonus\n• Woolworths Rewards - $8 cashback\n\nWould you like to see offers for Australia or UK?"
                ]
            },
            payments: {
                keywords: ['payment', 'payout', 'withdraw', 'money', 'cash', 'bank', 'paypal'],
                responses: [
                    "💳 **Payment Information:**\n\n• **Minimum Payout**: $10\n• **Payment Methods**: PayPal, Bank Transfer\n• **Processing Time**: 1-3 business days\n• **Payment Schedule**: Weekly on Fridays\n\nYour earnings are automatically tracked and paid out once you reach the minimum threshold!",
                    "💰 **How Payments Work:**\n\n1. Complete offers and earn cashback\n2. Reach $10 minimum threshold\n3. Request payout via PayPal or bank\n4. Receive payment within 1-3 days\n\nNeed help setting up your payment method?"
                ]
            },
            referrals: {
                keywords: ['referral', 'refer', 'friend', 'invite', 'bonus', 'share'],
                responses: [
                    "👥 **Referral Program:**\n\n• **Earn $5** for each friend you refer\n• **Your friend gets $2** signup bonus\n• **Unlimited referrals** - no cap on earnings!\n• **Track progress** in your dashboard\n\nShare your unique referral link and start earning extra cash!",
                    "🚀 **Referral Benefits:**\n\n• You: $5 per successful referral\n• Friend: $2 welcome bonus\n• Both: Access to exclusive offers\n\nYour referral link is in your account dashboard. Share it on social media, with friends, or via email!"
                ]
            },
            help: {
                keywords: ['help', 'support', 'problem', 'issue', 'error', 'bug', 'trouble'],
                responses: [
                    "🔧 **Common Issues & Solutions:**\n\n• **Offers not tracking**: Clear cookies, disable ad blockers\n• **Payment delays**: Check payment details, contact support\n• **Account issues**: Try logging out and back in\n• **Missing cashback**: Allow 24-48 hours for tracking\n\nStill need help? Contact our support team!",
                    "🆘 **Need More Help?**\n\n• **Email**: support@perkpocket.com\n• **Response Time**: Within 24 hours\n• **Live Chat**: Available 9 AM - 6 PM AEST\n\nDescribe your issue and we'll get back to you quickly!"
                ]
            },
            security: {
                keywords: ['security', 'safe', 'fraud', 'scam', 'legitimate', 'trust'],
                responses: [
                    "🔒 **Security & Trust:**\n\n• **Verified Partners**: All offers from legitimate companies\n• **Secure Payments**: Bank-level encryption\n• **Privacy Protected**: Your data is never sold\n• **Fraud Protection**: Advanced bot detection\n\nYour security is our top priority!",
                    "✅ **Why PerkPocket is Safe:**\n\n• SSL encryption for all data\n• Partnerships with major brands\n• Transparent terms and conditions\n• Regular security audits\n• 24/7 fraud monitoring\n\nEarn with confidence!"
                ]
            }
        };
    }

    toggleChat() {
        // Security check
        if (!window.securityManager.validateUserAction('chat_open')) {
            return;
        }

        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.style.display = 'flex';
        this.isOpen = true;
        
        // Log chat open event
        window.securityManager.logSecurityEvent('chat_opened');
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 100);
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.style.display = 'none';
        this.isOpen = false;
        
        // Log chat close event
        window.securityManager.logSecurityEvent('chat_closed');
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Security rate limiting
        if (!window.securityManager.checkRateLimit('chat_message')) {
            return;
        }

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Generate response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 2000);

        // Log message
        window.securityManager.logSecurityEvent('chat_message_sent', {
            messageLength: message.length
        });
    }

    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `<p>${message}</p>`;
        } else {
            messageDiv.innerHTML = `<p>${message}</p>`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({ sender, message, timestamp: new Date() });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<p>🤖 Typing...</p>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check each knowledge base category
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Default responses for unmatched queries
        const defaultResponses = [
            "🤔 I'm not sure about that specific question. Could you try asking about:\n\n• 🎯 Available offers\n• 💳 Payments and payouts\n• 👥 Referral program\n• 🔧 Technical support",
            "💬 I'd love to help! I can assist with information about offers, payments, referrals, and technical support. What would you like to know more about?",
            "🚀 Great question! While I might not have that exact information, I can help you with:\n\n• Finding the best offers\n• Payment information\n• Referral bonuses\n• Account support\n\nWhat interests you most?"
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    handleQuickAction(action) {
        // Security check
        if (!window.securityManager.validateUserAction('quick_action')) {
            return;
        }

        const responses = {
            offers: "🎯 **Current Top Offers:**\n\n🍽️ **HelloFresh AU** - $25 cashback\n📱 **AdGem** - $3.50 per app install\n🎁 **Swagbucks** - $5 signup bonus\n⛽ **Woolworths** - $8 grocery cashback\n\nWould you like to see offers for a specific category?",
            payments: "💳 **Quick Payment Info:**\n\n• Minimum: $10\n• Methods: PayPal, Bank Transfer\n• Time: 1-3 business days\n• Schedule: Weekly payouts\n\nNeed help with a specific payment question?",
            referrals: "👥 **Referral Quick Facts:**\n\n• You earn: $5 per referral\n• Friend gets: $2 bonus\n• No limits on referrals\n• Track in dashboard\n\nReady to start referring friends?",
            help: "🔧 **Quick Help:**\n\n• Check our FAQ section\n• Email: support@perkpocket.com\n• Response time: 24 hours\n• Live chat: 9 AM - 6 PM AEST\n\nWhat specific issue can I help with?"
        };

        const response = responses[action] || "I can help you with offers, payments, referrals, and support questions!";
        this.addMessage(response, 'bot');

        // Log quick action
        window.securityManager.logSecurityEvent('chat_quick_action', { action });
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new PerkPocketChatbot();
});

