# PerkPocket Platform v2.0

A complete affiliate marketing platform with hierarchical navigation, comprehensive admin controls, and enhanced security features.

## 🚀 Features

### User-Facing Application
- **Hierarchical Navigation**: Market → Category → Subcategory → Offers
- **Mobile-Responsive Design**: Optimized for all devices
- **Real-time Balance Tracking**: Live updates and progress monitoring
- **Interactive Chatbot**: AI-powered assistance and guidance
- **Comprehensive Offer Catalog**: 35+ AU/UK offers across 4 categories
- **Referral System**: Earn $5 per successful referral
- **Activity Tracking**: Complete history of user actions

### Admin Console
- **Secure Authentication**: Admin key + captcha protection
- **Comprehensive Dashboard**: Real-time statistics and analytics
- **Offer Management**: Add, edit, delete offers with full control
- **Affiliate Network Directory**: 6+ pre-loaded networks with signup links
- **User Management**: View balances, adjust accounts, export data
- **Analytics & Reporting**: Performance tracking and conversion metrics
- **Security Monitoring**: Event logging and suspicious activity detection
- **Settings Management**: Platform configuration and admin controls

### Security Features
- **CSRF Protection**: Token-based form validation
- **Rate Limiting**: Prevents abuse and spam
- **Session Management**: Automatic timeout and activity tracking
- **Input Validation**: Sanitization and type checking
- **Captcha Verification**: Human verification for admin access
- **Security Event Logging**: Comprehensive audit trail
- **Content Security Policy**: XSS and injection protection

## 📁 Project Structure

```
/public
 ├─ index.html          # Main user application
 ├─ style.css           # Responsive CSS styles
 ├─ app.js              # Main application logic
 ├─ chatbot.js          # AI chatbot functionality
 ├─ offer-wire.js       # Analytics and tracking
 ├─ offers.json         # Offer data (35+ offers)
 ├─ networks.json       # Affiliate network data
 └─ security.js         # Security and protection

/admin
 ├─ admin.html          # Admin console interface
 └─ admin.js            # Admin functionality

vercel.json             # Vercel deployment config
package.json            # Project configuration
README.md               # This file
```

## 🛠️ Installation & Setup

### Option 1: Static Deployment (Recommended)

1. **Extract the files**:
   ```bash
   unzip perkpocket-enhanced.zip
   cd perkpocket-enhanced
   ```

2. **Install dependencies** (optional):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   # or
   npx serve public -p 3000
   ```

4. **Access the application**:
   - User App: http://localhost:3000
   - Admin Console: http://localhost:3000/../admin/admin.html

### Option 2: Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Access your live site**:
   - User App: https://your-domain.vercel.app/public/
   - Admin Console: https://your-domain.vercel.app/admin/

## 🔧 Configuration

### Admin Access
- **Default Admin Key**: `admin-secret-key-here`
- **Change in**: Admin Console → Settings → Security Settings

### Offer Management
1. Access Admin Console
2. Navigate to "Manage Offers"
3. Click "+ Add New Offer"
4. Fill in offer details and affiliate URL
5. Save and publish

### Affiliate Networks
1. Access Admin Console
2. Navigate to "Affiliate Networks"
3. Browse pre-loaded networks:
   - HelloFresh Affiliate (Meal Kits)
   - ShareASale (Multi-Category)
   - CJ Affiliate (Multi-Category)
   - Fyber (App Installs)
   - TapJoy (App Installs)
   - ironSource (App Installs)

### Adding New Networks
1. Click "+ Add Network"
2. Fill in network details
3. Include signup URL and commission structure
4. Save to directory

## 📊 Analytics & Tracking

### Built-in Analytics
- **Offer Performance**: Click-through rates, conversions, revenue
- **User Behavior**: Navigation patterns, time spent, device types
- **Market Analysis**: AU vs UK performance comparison
- **Conversion Tracking**: Real-time completion monitoring

### Data Export
- User data (CSV format)
- Analytics reports (CSV format)
- Security logs (JSON format)

## 🔒 Security Features

### Authentication
- Multi-factor admin access (key + captcha)
- Session timeout management
- Failed attempt lockout protection

### Data Protection
- CSRF token validation
- Input sanitization and validation
- XSS protection via CSP headers
- Rate limiting on API endpoints

### Monitoring
- Security event logging
- Suspicious activity detection
- Developer tools monitoring
- Console access tracking

## 🌐 Supported Markets & Categories

### Markets
- **🇦🇺 Australia**: Localized offers and brands
- **🇬🇧 United Kingdom**: UK-specific deals and services

### Categories
- **🍽️ Meal Kits**: HelloFresh, Marley Spoon, Dinnerly, Gousto
- **📱 App Installs**: Gaming apps, utility apps, mobile games
- **🎁 Freebies**: Samples, surveys, trials, product tests
- **⛽ Groceries & Fuel**: Supermarkets, fuel stations, shopping rewards

### Subcategories
- **Meal Kits**: Premium Kits, Budget Kits, Specialty Diets
- **App Installs**: Gaming Apps, Utility Apps
- **Freebies**: Samples, Surveys, Trials
- **Groceries & Fuel**: Supermarkets, Fuel Stations

## 💰 Monetization

### Revenue Streams
1. **Affiliate Commissions**: Earn from completed offers
2. **Referral Bonuses**: $5 per successful referral
3. **Premium Placements**: Featured offer positions
4. **Network Partnerships**: Direct affiliate relationships

### Payout Structure
- **Minimum Cashout**: $10 (configurable)
- **Payment Methods**: PayPal, Bank Transfer, Gift Cards
- **Processing Time**: 3-5 business days
- **Referral Bonus**: $5 per conversion

## 🚀 Deployment Options

### 1. Vercel (Recommended)
- Automatic HTTPS
- Global CDN
- Zero configuration
- Instant deployments

### 2. Netlify
- Drag & drop deployment
- Form handling
- Split testing
- Analytics

### 3. GitHub Pages
- Free hosting
- Custom domains
- Automatic builds
- Version control

### 4. Self-Hosted
- Full control
- Custom server setup
- Database integration
- Advanced analytics

## 📱 Mobile Optimization

### Responsive Design
- Touch-friendly buttons (44px minimum)
- Optimized typography for small screens
- Horizontal scroll tabs for mobile
- Fast loading with minimal JavaScript

### PWA Features
- Installable web app
- Offline functionality
- Push notifications (configurable)
- App-like experience

## 🔧 Customization

### Branding
- Update logo and colors in CSS
- Modify platform name in settings
- Customize offer categories
- Add market-specific content

### Functionality
- Add new offer types
- Integrate payment processors
- Connect external APIs
- Implement custom tracking

## 📈 Performance

### Optimization
- Minified CSS and JavaScript
- Optimized images and assets
- Lazy loading for better performance
- Efficient data structures

### Monitoring
- Real-time analytics
- Performance metrics
- Error tracking
- User behavior analysis

## 🆘 Support & Maintenance

### Regular Updates
- Security patches
- Feature enhancements
- Bug fixes
- Performance improvements

### Monitoring
- Uptime monitoring
- Error logging
- Performance tracking
- Security scanning

## 📄 License

MIT License - Feel free to modify and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For technical support or questions:
- Check the admin console logs
- Review security events
- Export analytics for debugging
- Contact development team

---

**PerkPocket Platform v2.0** - Complete affiliate marketing solution with professional admin controls and enhanced security features.

