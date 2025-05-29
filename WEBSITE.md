# DropSentinel Website

This repository includes a modern, responsive website for DropSentinel built with Next.js and deployed to GitHub Pages.

## 🌐 Live Website

Visit the live website at: [https://jsb2010.github.io/virus-total-scanner-app/website](https://jsb2010.github.io/virus-total-scanner-app/website)

## 🏗️ Website Structure

The website is built using the same technology stack as the main application:

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (static export)

## 📁 File Structure

```
app/website/                 # Website pages
├── layout.tsx              # Website-specific layout
├── page.tsx                # Homepage
├── download/
│   └── page.tsx            # Download page
├── docs/
│   └── page.tsx            # Documentation
└── support/
    └── page.tsx            # Support page

components/website/          # Website-specific components
├── header.tsx              # Navigation header
├── footer.tsx              # Site footer
├── hero-section.tsx        # Homepage hero
├── features-section.tsx    # Features showcase
├── stats-section.tsx       # Statistics display
├── testimonials-section.tsx # User testimonials
└── cta-section.tsx         # Call-to-action
```

## 🚀 Development

### Running the Website Locally

```bash
# Start the website in development mode
npm run website:dev

# Build the website for production
npm run website:build

# Export static files for deployment
npm run website:export
```

### Building for Production

The website uses Next.js static export to generate a fully static site that can be deployed to GitHub Pages:

```bash
# Build and export the website
BUILD_WEBSITE=true npm run build
```

## 🎨 Design System

The website uses the same design system as the main application:

- **Colors**: Blue and purple gradient theme
- **Typography**: Inter font family
- **Components**: Consistent with app UI
- **Dark/Light Mode**: Full theme support
- **Responsive**: Mobile-first design

## 📄 Pages

### Homepage (`/website`)
- Hero section with app preview
- Feature highlights
- Platform support information
- User testimonials
- Call-to-action for downloads

### Download (`/website/download`)
- Platform-specific download options
- System requirements
- Installation instructions
- Security information

### Documentation (`/website/docs`)
- Quick start guide
- Feature explanations
- Troubleshooting tips
- FAQ section

### Support (`/website/support`)
- Support channels
- Community links
- Contact information
- Bug reporting

## 🚀 Deployment

The website is automatically deployed to GitHub Pages when changes are pushed to the main branch:

1. **GitHub Actions** builds the static site
2. **Deploys** to `gh-pages` branch
3. **Serves** from GitHub Pages

### Manual Deployment

```bash
# Deploy to GitHub Pages
npm run website:deploy
```

## 🔧 Configuration

Website-specific configuration is handled through environment variables:

- `BUILD_WEBSITE=true` - Enables static export mode
- Configures base path for GitHub Pages
- Optimizes images for static hosting

## 📱 Features

- **Ultra-modern design** with smooth animations
- **Fully responsive** across all devices
- **SEO optimized** with proper meta tags
- **Fast loading** with static generation
- **Accessible** following WCAG guidelines
- **Progressive enhancement** for better UX

## 🤝 Contributing

To contribute to the website:

1. Make changes to files in `app/website/` or `components/website/`
2. Test locally with `npm run website:dev`
3. Submit a pull request
4. Website will auto-deploy on merge

## 📊 Analytics

The website includes:

- **Performance monitoring** through Core Web Vitals
- **SEO optimization** for search engines
- **Social media integration** with Open Graph tags
- **Accessibility compliance** with ARIA labels

---

**Built with ❤️ for the DropSentinel community**
