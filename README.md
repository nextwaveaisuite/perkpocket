# 🔒 PerkPocket Secure - Enhanced Affiliate Marketing Platform

A professional affiliate marketing platform with advanced security features, automated chatbot support, and comprehensive fraud protection.

## 🚀 Features

### 🛡️ Security Features
- **hCaptcha Verification** - Bot protection for both user and admin areas
- **Rate Limiting** - Prevents abuse and spam
- **Bot Detection** - Advanced algorithms to identify automated traffic
- **Activity Monitoring** - Real-time security event logging
- **Fraud Protection** - Multiple layers of security validation
- **Session Management** - Secure admin sessions with timeout

### 🤖 Automated Support
- **24/7 Chatbot** - Intelligent customer support
- **Quick Actions** - Instant responses for common questions
- **Knowledge Base** - Comprehensive FAQ system
- **Natural Language Processing** - Smart keyword recognition
- **Conversation History** - Maintains context during chat sessions

### 💰 Affiliate Platform
- **64 Premium Offers** - Across AU/UK markets
- **4 Categories** - Meal Kits, App Installs, Freebies, Groceries & Fuel
- **Market Separation** - Clean AU/UK organization
- **Admin Management** - Full offer control and monitoring
- **Revenue Tracking** - Comprehensive analytics

## 📁 Project Structure

```
perkpocket-secure/
├── public/                 # Main platform files
│   ├── index.html         # Main platform interface
│   ├── style.css          # Enhanced styling with security modals
│   ├── app.js             # Main application logic
│   ├── chatbot.js         # Automated support chatbot
│   └── security.js        # Security and hCaptcha integration
├── admin/                 # Admin panel
│   ├── admin.html         # Secure admin interface
│   └── admin.js           # Admin panel functionality
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
└── README.md             # This file
```

## 🔧 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd perkpocket-secure
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure hCaptcha
1. Sign up at [hCaptcha.com](https://hcaptcha.com)
2. Get your site key and secret key
3. Replace the demo site key in HTML files:
   - Current: `10000000-ffff-ffff-ffff-000000000001`
   - Replace with your actual site key

### 4. Local Development
```bash
npm run dev
```
Access at: http://localhost:8000

### 5. Deploy to Vercel
```bash
npm run deploy
```

## 🛡️ Security Configuration

### hCaptcha Setup
1. **Get Keys**: Register at hCaptcha.com
2. **Update Site Key**: Replace in HTML files
3. **Configure Backend**: Add secret key validation (production)

### Security Headers
- Content Security Policy (CSP) configured
- XSS Protection enabled
- Frame Options set to DENY
- HTTPS enforcement

### Rate Limiting
- Click actions: 10 per minute
- Chat messages: 10 per minute
- Admin actions: 5 per minute

## 🤖 Chatbot Configuration

### Knowledge Base Categories
- **Offers & Earnings** - Platform offers and payouts
- **Payments** - Payment methods and processing
- **Referrals** - Referral program details
- **Technical Support** - Troubleshooting and help
- **Security** - Platform safety and trust

### Customization
Edit `chatbot.js` to:
- Add new response categories
- Update knowledge base
- Modify quick action buttons
- Change conversation flow

## 👨‍💼 Admin Panel

### Access
- **URL**: `/admin/admin.html`
- **Key**: `admin-secret-key-here`
- **Security**: hCaptcha verification required

### Features
- **Dashboard** - Platform statistics
- **Offer Management** - AU/UK market organization
- **User Management** - User tracking and analytics
- **Payout Management** - Payment processing
- **Security Dashboard** - Security monitoring
- **Settings** - Platform configuration

### Navigation Flow
1. **Login** → Security verification
2. **Manage Offers** → Market selection (AU/UK)
3. **Categories** → Meal Kits, App Installs, Freebies, Groceries
4. **Individual Offers** → Edit/Test/Delete controls

## 💰 Offers Database

### Australia (32 offers)
- **Meal Kits**: 8 offers ($15-25 each)
- **App Installs**: 8 offers ($2.60-4.20 each)
- **Freebies**: 8 offers ($3.60-5.00 each)
- **Groceries & Fuel**: 8 offers ($5.50-8.00 each)

### United Kingdom (32 offers)
- **Meal Kits**: 8 offers (£12-22 each)
- **App Installs**: 8 offers (£2.50-3.40 each)
- **Freebies**: 8 offers (£3.00-4.50 each)
- **Groceries & Fuel**: 8 offers (£5.50-7.50 each)

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
vercel --prod
```

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `/`

### Traditional Hosting
Upload all files to web server root directory

## 🔒 Security Best Practices

### Production Setup
1. **Replace Demo Keys** - Use real hCaptcha keys
2. **Change Admin Key** - Update from default
3. **Enable HTTPS** - SSL certificate required
4. **Configure CSP** - Adjust Content Security Policy
5. **Set Up Monitoring** - Security event logging
6. **Rate Limiting** - Configure appropriate limits

### Monitoring
- Security events logged to console
- Admin actions tracked
- User behavior monitoring
- Fraud detection alerts

## 📊 Analytics & Tracking

### Security Events
- User verification attempts
- Admin login attempts
- Offer click tracking
- Bot detection alerts
- Rate limit violations

### Business Metrics
- Offer conversion rates
- User engagement
- Revenue tracking
- Market performance (AU vs UK)

## 🆘 Support & Maintenance

### Regular Updates
- Security patches
- Offer database updates
- New affiliate partnerships
- Feature enhancements

### Monitoring
- Security event logs
- Performance metrics
- User feedback
- Conversion tracking

## 📈 Revenue Potential

### Conservative Estimates
- **Month 1-3**: $500-2,000/month
- **Month 4-6**: $2,000-5,000/month
- **Year 1**: $50,000-80,000

### Growth Factors
- SEO optimization
- Social media marketing
- Influencer partnerships
- Referral program growth

## 🔐 Admin Key

**Default Admin Key**: `admin-secret-key-here`

⚠️ **IMPORTANT**: Change this key in production for security!

## 📞 Contact & Support

For technical support or questions:
- **Email**: support@perkpocket.com
- **Documentation**: This README file
- **Security Issues**: Report immediately

---

**Built with security, performance, and user experience in mind.** 🚀

© 2024 PerkPocket - Secure Affiliate Marketing Platform

