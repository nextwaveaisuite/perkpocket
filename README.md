# 💰 PerkPocket - Affiliate Marketing Platform

A complete, mobile-responsive affiliate marketing platform featuring 35+ AU/UK offers, hierarchical navigation, admin panel, and comprehensive security features.

## ✨ Features

### User-Facing Features
- **35+ Affiliate Offers** - Curated AU/UK offers across multiple categories
- **Hierarchical Navigation** - Market → Category → Subcategory → Offers
- **Mobile-Responsive Design** - Optimized for all devices
- **Progress Tracking** - Visual balance and goal tracking
- **AI Chatbot** - Intelligent offer recommendations
- **Offer Wire** - Real-time offer updates and notifications
- **Security Features** - CSRF protection, rate limiting, captcha verification

### Admin Features
- **Offer Management** - Add, edit, delete offers via admin panel
- **Affiliate Network Directory** - Comprehensive network database with signup links
- **Analytics Dashboard** - Track performance and user engagement
- **Security Console** - Monitor security events and rate limits
- **Settings Management** - Configure platform settings and admin credentials

### Markets & Categories

**Australia:**
- Meal Kits (Premium, Budget-Friendly, Specialty)
- Streaming Services (Entertainment, Sports, Kids & Family)
- Fitness & Wellness (Gym, Nutrition, Mental Health)
- Shopping & Retail (Fashion, Electronics, Home & Garden)

**United Kingdom:**
- Meal Kits (Premium, Budget-Friendly, Specialty)
- Streaming Services (Entertainment, Sports, Kids & Family)
- Fitness & Wellness (Gym, Nutrition, Mental Health)
- Shopping & Retail (Fashion, Electronics, Home & Garden)

## 🚀 Quick Deploy to Vercel

### Option 1: Vercel CLI (Fastest - 3 Steps)

```bash
# 1. Navigate to project directory
cd perkpocket-final

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod
```

**Your URLs:**
- Main App: `https://your-project.vercel.app/`
- Admin Panel: `https://your-project.vercel.app/admin`

### Option 2: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Upload the `perkpocket-final` folder
4. Click "Deploy"

### Option 3: GitHub Integration

1. Push to GitHub repository
2. Connect repository to Vercel
3. Vercel auto-deploys on every push

## 📁 Project Structure

```
perkpocket-final/
├── public/                    # Main application
│   ├── index.html            # Homepage
│   ├── style.css             # Styles
│   ├── app.js                # Main app logic
│   ├── offers.json           # 35+ AU/UK offers
│   ├── networks.json         # Affiliate networks
│   ├── chatbot.js            # AI chatbot
│   ├── offer-wire.js         # Offer tracking
│   └── security.js           # Security features
├── admin/                     # Admin panel
│   ├── admin.html            # Admin dashboard
│   └── admin.js              # Admin logic
├── vercel.json               # Vercel configuration (FIXED)
├── .vercelignore             # Deployment exclusions
├── package.json              # Project metadata
├── test-routing.html         # Routing test page
└── README.md                 # This file
```

## 🔧 Configuration

### vercel.json (Fixed for Proper Routing)

The `vercel.json` file is pre-configured with:
- **Rewrites** - Proper routing for `/` and `/admin`
- **Security Headers** - X-Content-Type-Options, X-Frame-Options, CSP, etc.
- **Static File Serving** - Optimized for performance

**Routing:**
- `/` → `/public/index.html`
- `/admin` → `/admin/admin.html`
- `/style.css` → `/public/style.css`
- All other files route through appropriate directories

## 🧪 Testing Your Deployment

After deployment, visit the test page:

`https://your-project.vercel.app/test-routing.html`

Click **"Run All Tests"** to verify:
- ✅ Main app loads correctly
- ✅ Admin panel loads correctly
- ✅ CSS files load correctly
- ✅ JSON data files load correctly
- ✅ JavaScript files load correctly

## 🔑 Admin Access

**Default Credentials:**
- Admin Key: `admin-secret-key-here`
- Captcha: Enter the displayed code shown on login page

**⚠️ IMPORTANT:** Change the admin key immediately after deployment!

**To Change Admin Key:**
1. Login to admin panel
2. Go to Settings tab
3. Enter new admin key
4. Save changes

## 🛡️ Security Features

- **CSRF Protection** - Token-based request validation
- **Rate Limiting** - Prevents abuse and spam
- **Captcha Verification** - Human verification for admin access
- **Security Headers** - Comprehensive HTTP security headers
- **XSS Protection** - Content Security Policy configured
- **HTTPS** - Automatic via Vercel

## 📊 Analytics

The admin panel includes:
- Total offers count
- Active offers tracking
- Completion statistics
- Revenue tracking (simulated)
- User engagement metrics

## 🎨 Customization

### Adding New Offers

**Via Admin Panel:**
1. Login to `/admin`
2. Click "Add New Offer"
3. Fill in offer details
4. Save

**Via JSON File:**
Edit `public/offers.json`:
```json
{
  "id": "unique-id",
  "title": "Offer Title",
  "description": "Offer description",
  "reward": "Reward amount",
  "market": "AU or UK",
  "category": "Category name",
  "subcategory": "Subcategory name",
  "link": "https://affiliate-link.com",
  "network": "Network name",
  "requirements": ["Requirement 1", "Requirement 2"],
  "featured": false
}
```

### Adding Affiliate Networks

Edit `public/networks.json`:
```json
{
  "name": "Network Name",
  "description": "Network description",
  "signupLink": "https://signup-link.com",
  "commission": "Commission structure",
  "paymentMethods": ["PayPal", "Bank Transfer"],
  "minPayout": "$50",
  "countries": ["AU", "UK"]
}
```

### Styling

Edit `public/style.css` to customize:
- Colors and branding
- Layout and spacing
- Typography
- Mobile responsiveness

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly UI elements
- Mobile navigation menu
- Optimized images and assets
- Fast loading times

## 🔍 SEO Features

- Semantic HTML structure
- Meta tags configured
- Clean URL structure
- Fast page load times
- Mobile-friendly design

## 🚨 Troubleshooting

### 404 Error on Root URL
- Verify `vercel.json` exists in root directory
- Check that `public/index.html` exists
- Clear Vercel cache and redeploy

### Admin Panel Not Loading
- Use `/admin` (not `/admin.html`)
- Check browser console for errors
- Verify `admin/admin.html` exists

### CSS Not Loading
- Check file paths are relative
- Verify `public/style.css` exists
- Clear browser cache (Ctrl+Shift+R)

### Offers Not Displaying
- Verify `public/offers.json` is valid JSON
- Check browser console for errors
- Ensure offers have required fields

## 📈 Performance

Vercel provides:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS/SSL
- ✅ Gzip/Brotli compression
- ✅ Edge caching
- ✅ DDoS protection
- ✅ 99.99% uptime SLA

## 🎯 Monetization

This platform is ready for monetization through:
- **Affiliate Commissions** - Earn from offer completions
- **Network Partnerships** - Partner with affiliate networks
- **Premium Features** - Add paid features for users
- **Advertising** - Display ads alongside offers

## 📞 Support

For deployment issues:
- Check the test-routing.html page
- Review Vercel deployment logs
- Verify all files are uploaded correctly

For platform customization:
- Edit JSON files for content changes
- Modify CSS for styling changes
- Update JavaScript for functionality changes

## 📝 License

This is a custom-built affiliate marketing platform. Modify and use as needed for your business.

## 🎉 Getting Started

1. **Deploy** using one of the methods above
2. **Test** using the routing test page
3. **Login** to admin panel and change credentials
4. **Customize** offers and branding
5. **Launch** and start earning!

---

**Your PerkPocket platform is ready to generate revenue!** 💰

Deploy now and start earning from affiliate offers across AU/UK markets!

