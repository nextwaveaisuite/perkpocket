// Intelligent Chatbot for PerkPocket using OpenAI
class SmartChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.addWelcomeMessage();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div id="smartChatWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                <button id="chatToggle" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4a90e2, #357abd); border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    💬
                </button>
                <div id="chatWindow" style="display: none; position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: #1a1f2e; border: 1px solid #3a4451; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); flex-direction: column;">
                    <div style="background: linear-gradient(135deg, #4a90e2, #357abd); padding: 15px; border-radius: 16px 16px 0 0; color: white; font-weight: 600;">
                        PerkPocket Assistant
                        <button id="chatClose" style="float: right; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                    <div id="chatMessages" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px;"></div>
                    <div style="padding: 15px; border-top: 1px solid #3a4451;">
                        <input id="chatInput" type="text" placeholder="Ask me anything..." style="width: 100%; padding: 10px; background: #2a3441; border: 1px solid #3a4451; border-radius: 8px; color: #e6e6e6; font-size: 14px;">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);

        document.getElementById('chatToggle').onclick = () => this.toggle();
        document.getElementById('chatClose').onclick = () => this.close();
        document.getElementById('chatInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    }

    toggle() {
        this.isOpen = !this.isOpen;
        document.getElementById('chatWindow').style.display = this.isOpen ? 'flex' : 'none';
    }

    close() {
        this.isOpen = false;
        document.getElementById('chatWindow').style.display = 'none';
    }

    addWelcomeMessage() {
        this.addMessage('assistant', 'Hi! I\'m your PerkPocket assistant. I can help you with offers, earnings, and any questions about the platform. What would you like to know?');
    }

    addMessage(role, content) {
        const messagesDiv = document.getElementById('chatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            padding: 10px 12px;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            ${role === 'user' ? 'background: #4a90e2; color: white; align-self: flex-end; margin-left: auto;' : 'background: #2a3441; color: #e6e6e6;'}
        `;
        msgDiv.textContent = content;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        this.messages.push({ role, content });
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing';
        typingDiv.style.cssText = 'padding: 10px; color: #b0b0b0; font-style: italic;';
        typingDiv.textContent = 'Assistant is typing...';
        document.getElementById('chatMessages').appendChild(typingDiv);

        try {
            const response = await this.getAIResponse(message);
            document.getElementById('typing').remove();
            this.addMessage('assistant', response);
        } catch (error) {
            document.getElementById('typing').remove();
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    async getAIResponse(userMessage) {
        // Context about PerkPocket
        const systemPrompt = `You are a helpful assistant for PerkPocket, an Australian affiliate marketing platform. 
Key facts:
- Users complete offers to earn money
- Daily limit: 10 offers per day
- Platform has 20+ AU offers across categories: meal kits, games, surveys, shopping, finance
- Payouts range from $5-$25 per offer
- Users must be in Australia
- Offers reset daily at midnight
- Minimum cashout: $10

Answer questions about offers, earnings, how the platform works, and troubleshooting. Be friendly and concise.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.OPENAI_API_KEY || 'sk-proj-demo'}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages.slice(-6),
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 200,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Chatbot error:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    getFallbackResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('limit') || msg.includes('how many')) {
            return `You can complete up to 10 offers per day. Your limit resets at midnight. Check your remaining offers in the dashboard.`;
        }
        if (msg.includes('earn') || msg.includes('money') || msg.includes('pay')) {
            return `Offers pay between $5-$25 each. Complete the offer requirements within the timeframe to earn. Minimum cashout is $10.`;
        }
        if (msg.includes('offer') || msg.includes('available')) {
            return `We have 20+ AU offers including meal kits, games, surveys, shopping, and finance. Browse by category to find offers that interest you.`;
        }
        if (msg.includes('reset') || msg.includes('when')) {
            return `Your daily limit resets at midnight (00:00) Australian time. You'll get 10 new offer slots each day.`;
        }
        
        return `I can help you with offers, earnings, daily limits, and platform questions. What would you like to know?`;
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.smartChatbot = new SmartChatbot();
});
