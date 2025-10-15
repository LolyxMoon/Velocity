# 📚 GitBook Setup Guide

Complete guide to publishing your VelocityBets documentation to GitBook (like [Grail Index](https://docs.grailindex.io/)).

---

## ✅ What's Been Created

Your complete GitBook documentation is ready in the `/docs` folder:

### 📁 Structure

```
docs/
├── README.md                          # Homepage
├── SUMMARY.md                         # Table of contents
├── .gitbook.yaml                      # GitBook config
│
├── getting-started/
│   ├── what-is-velocitybets.md       # Overview
│   ├── quick-start.md                # Quick start guide
│   └── faq.md                        # FAQ
│
├── how-it-works/
│   ├── prediction-markets.md         # Prediction markets explained
│   ├── parimutuel.md                 # Parimutuel betting
│   ├── oracle-resolution.md          # Oracle resolution
│   └── fees.md                       # Fee structure
│
├── markets/
│   ├── active-markets.md             # Active markets
│   ├── rules.md                      # Market rules
│   ├── how-to-bet.md                 # How to bet guide
│   └── claiming.md                   # Claiming winnings
│
├── for-developers/
│   ├── integration.md                # Integration guide
│   ├── smart-contracts.md            # Contract architecture
│   ├── contract-addresses.md         # Deployed addresses
│   └── api-reference.md              # API reference
│
└── legal/
    ├── terms-of-service.md           # Terms of service
    ├── risk-factors.md               # Risk factors
    └── disclaimer.md                 # Disclaimer
```

---

## 🚀 Publishing to GitBook

### Option 1: GitBook Cloud (Recommended)

#### Step 1: Create GitBook Account

1. Go to [gitbook.com](https://www.gitbook.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with:
   - GitHub account (recommended)
   - Email
   - Google account

#### Step 2: Create New Space

1. Click **"New Space"** or **"Create new..."**
2. Choose **"Git Sync"** (for GitHub integration)
3. Or choose **"Import"** (to upload files)

#### Step 3: Connect GitHub Repository

**If using Git Sync**:

1. Authorize GitBook to access your GitHub
2. Select your repository
3. Choose the `/docs` folder as root
4. Set branch (usually `main` or `master`)
5. Click **"Import"**

**If using Import**:

1. Click **"Import"**
2. Select **"GitHub"**
3. Or drag and drop your `/docs` folder
4. Upload and GitBook will auto-detect structure

#### Step 4: Configure

1. **Set Space Name**: "VelocityBets Docs"
2. **Set Description**: "Documentation for VelocityBets prediction markets"
3. **Choose Visibility**: 
   - Public (recommended for docs)
   - Private (if needed)
4. **Custom Domain** (optional): `docs.velocitybets.com`

#### Step 5: Publish

1. Click **"Publish"** button
2. Your docs are now live!
3. Share link: `https://your-org.gitbook.io/velocitybets/`

---

### Option 2: Self-Hosted GitBook

#### Install GitBook CLI

```bash
npm install -g gitbook-cli
```

#### Initialize and Build

```bash
cd docs/
gitbook init
gitbook build
```

#### Serve Locally (for testing)

```bash
gitbook serve
```

Open `http://localhost:4000` to preview.

#### Deploy to GitHub Pages

```bash
# Build to _book folder
gitbook build

# Copy to GitHub Pages branch
git checkout -b gh-pages
cp -r _book/* .
git add .
git commit -m "Deploy GitBook"
git push origin gh-pages
```

Enable GitHub Pages in repository settings → Source: `gh-pages` branch.

---

## 🎨 Customization

### Brand Colors

Edit in GitBook dashboard:
- **Primary Color**: #your-brand-color (e.g., #6366f1)
- **Logo**: Upload your logo (300x60px recommended)
- **Favicon**: Upload favicon.ico

### Custom Domain

1. Buy domain (e.g., `docs.velocitybets.com`)
2. In GitBook settings → **Domain**
3. Add custom domain
4. Update DNS:
   ```
   CNAME docs.velocitybets.com → your-org.gitbook.io
   ```
5. Verify domain ownership

### Navigation

Edit `SUMMARY.md` to change table of contents structure.

### Themes

GitBook Cloud offers themes in settings:
- Light mode
- Dark mode
- Auto (follows system)

---

## 📝 Maintenance

### Updating Content

**Method 1: Git Sync (Automatic)**
1. Edit markdown files in `/docs`
2. Commit and push to GitHub
3. GitBook auto-syncs and publishes

**Method 2: GitBook Editor (Manual)**
1. Edit directly in GitBook web editor
2. Click **"Merge"** when done
3. Changes sync back to GitHub

### Adding New Pages

1. Create new `.md` file in appropriate folder
2. Add entry to `SUMMARY.md`:
   ```markdown
   * [New Page Title](folder/new-page.md)
   ```
3. Commit and push (or edit in GitBook)

### Versioning

GitBook supports versioning:
1. Go to **Space Settings** → **Versions**
2. Create new version for major updates
3. Users can switch between versions

---

## 🔗 Integration

### Website Integration

#### Embed Documentation

```html
<!-- Embed GitBook in your site -->
<iframe 
  src="https://your-org.gitbook.io/velocitybets/" 
  width="100%" 
  height="800px"
  frameborder="0"
></iframe>
```

#### Link from Website

```html
<a href="https://docs.velocitybets.com" target="_blank">
  📚 Read Documentation
</a>
```

### Search Integration

GitBook includes built-in search. Users can:
- Press `/` or `Ctrl+K` to search
- Search is instant and indexes all content

---

## 🌐 Multi-Language Support (Future)

To add translations:

1. Create language folders:
   ```
   docs/
   ├── en/          # English (default)
   ├── zh/          # Chinese
   ├── es/          # Spanish
   └── LANGS.md     # Language config
   ```

2. Create `LANGS.md`:
   ```markdown
   * [English](en/)
   * [中文](zh/)
   * [Español](es/)
   ```

3. Duplicate all `.md` files in each language folder

---

## 📊 Analytics

### Add Google Analytics

1. Get GA tracking ID (e.g., `G-XXXXXXXXXX`)
2. In GitBook → **Integrations** → **Google Analytics**
3. Enter tracking ID
4. Save

### GitBook Insights

GitBook Cloud provides built-in analytics:
- Page views
- Search queries
- Most viewed pages
- User engagement

---

## ✨ Advanced Features

### Search Keywords

Add to front matter in `.md` files:

```markdown
---
description: Detailed guide on how to place bets on VelocityBets
---

# How to Bet
...
```

### Page Covers

Add hero images:

```markdown
---
cover: .gitbook/assets/cover.png
---

# Welcome to VelocityBets
...
```

### Hints and Callouts

```markdown
{% hint style="info" %}
This is an info callout!
{% endhint %}

{% hint style="warning" %}
Warning: High risk!
{% endhint %}

{% hint style="success" %}
Success message!
{% endhint %}
```

### Tabs

```markdown
{% tabs %}
{% tab title="JavaScript" %}
```javascript
const market = await factory.getMarket(0);
```
{% endtab %}

{% tab title="Python" %}
```python
market = factory.functions.getMarket(0).call()
```
{% endtab %}
{% endtabs %}
```

---

## 🎯 Best Practices

### SEO Optimization

1. ✅ Use descriptive page titles
2. ✅ Add meta descriptions
3. ✅ Include keywords naturally
4. ✅ Link between pages
5. ✅ Submit sitemap to Google

### Content Quality

1. ✅ Keep paragraphs short
2. ✅ Use headers (H2, H3) for structure
3. ✅ Add examples and code snippets
4. ✅ Include diagrams/tables where helpful
5. ✅ Update regularly

### Navigation

1. ✅ Logical folder structure
2. ✅ Clear page titles
3. ✅ Breadcrumbs (automatic in GitBook)
4. ✅ Next/Previous links (automatic)
5. ✅ Search-friendly content

---

## 🐛 Troubleshooting

### Links Not Working

**Problem**: Broken links between pages

**Solution**: Use relative paths:
```markdown
✅ Good: [FAQ](../getting-started/faq.md)
❌ Bad: [FAQ](/docs/getting-started/faq.md)
```

### Images Not Showing

**Problem**: Images not loading

**Solution**: 
1. Create `.gitbook/assets/` folder
2. Place images there
3. Reference: `![Image](.gitbook/assets/image.png)`

### SUMMARY.md Changes Not Reflecting

**Problem**: TOC not updating

**Solution**:
1. Check SUMMARY.md syntax
2. Ensure all paths are correct
3. Re-sync Git or re-publish

---

## 📚 Resources

### Official GitBook Docs
- [GitBook Documentation](https://docs.gitbook.com/)
- [Markdown Guide](https://docs.gitbook.com/content-creation/markdown)
- [Git Sync](https://docs.gitbook.com/getting-started/git-sync)

### Examples
- [Grail Index](https://docs.grailindex.io/) - Crypto project docs
- [Uniswap](https://docs.uniswap.org/) - DeFi protocol docs
- [Tellor](https://docs.tellor.io/) - Oracle docs

---

## ✅ Next Steps

1. **Create GitBook Account** at [gitbook.com](https://www.gitbook.com/)
2. **Import `/docs` folder** to GitBook
3. **Customize branding** (logo, colors, domain)
4. **Publish** your documentation
5. **Share** the link!

---

## 🎉 Your Documentation is Ready!

All content has been written with:
- ✅ **Four.meme focus** emphasized throughout
- ✅ **Trenches meta** positioning highlighted
- ✅ **Complete user guides** for all experience levels
- ✅ **Developer documentation** for integration
- ✅ **Legal disclaimers** for compliance
- ✅ **Professional structure** like Grail Index

**Just publish to GitBook and you're done!**

---

**Questions?** 
- Check [GitBook Docs](https://docs.gitbook.com/)
- Ask on [Twitter](https://twitter.com/wearetellor)

**Good luck! 🚀**

