# 💰 Cursor Usage & Cost Tracker

> **Monitor your Cursor AI usage, token consumption, and costs in real-time with detailed breakdowns by model and session**

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://marketplace.visualstudio.com/items?itemName=coconut.cursor-price-tracking)
[![New Release](https://img.shields.io/badge/status-new%20release-brightgreen.svg)](https://marketplace.visualstudio.com/items?itemName=coconut.cursor-price-tracking)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Take control of your Cursor AI spending with comprehensive usage tracking and cost monitoring directly in your VS Code editor. Never be surprised by your AI usage costs again!

![Cursor Price Tracking Extension Screenshot](./example.png)

*Real-time usage tracking with detailed cost breakdowns, session history, and color-coded indicators*

## 🚀 Quick Setup - Let's Get Started!

> **💡 Don't worry! Setting up this extension is easier than you think. We'll walk you through it step by step.**

## ⚙️ One-Time Setup Guide

### 🔑 **Getting Your Session Token** (Takes 2 minutes!)

**✨ Good news:** We just need one thing to get started - your Cursor session token. Think of it like a key that lets the extension see your usage data.

**🔒 Privacy first:** This token stays safely on your computer and is never shared with anyone!

<details>
<summary><strong>📋 Click here for easy step-by-step instructions</strong></summary>

#### 1️⃣ **Visit Your Cursor Dashboard**
```
1.1 🌐 Go to: https://cursor.com/dashboard
1.2 👋 Make sure you're logged in (you should see your usage data)
```

#### 2️⃣ **Open Developer Tools** (Don't worry, it's easier than it sounds!)
```
2.1 ⌨️  Just press F12 on your keyboard
2.2 🖱️  Or right-click anywhere and select "Inspect" or "Inspect Element"
```

#### 3️⃣ **Find Your Session Token** (We'll help you navigate!)

**Using Chrome, Edge, or Brave? Here's your path:**
```
3.1 📱 Look for the "Application" tab at the top
3.2 📂 On the left side, click "Storage" then "Cookies"
3.3 🔗 Click on "https://cursor.com"
3.4 🔍 Scroll down until you see "WorkosCursorSessionToken"
3.5 📋 Double-click the long value next to it to select everything
```

**Using Firefox? No problem:**
```
3.1 📱 Look for the "Storage" tab at the top
3.2 📂 On the left side, click "Cookies"
3.3 🔗 Click on "https://cursor.com"
3.4 🔍 Find "WorkosCursorSessionToken" in the list
3.5 📋 Right-click the value and select "Copy Value"
```

**Using Safari? We've got you covered:**
```
3.1 📱 Look for the "Storage" tab
3.2 📂 Click "Cookies" on the left
3.3 🔗 Select "cursor.com"
3.4 🔍 Find "WorkosCursorSessionToken"
3.5 📋 Double-click the value to select and copy
```

> **💡 Tip**: The token should be a long string (100+ characters). If it looks short, you might have the wrong one!

#### 4️⃣ **Connect the Extension** (Almost done! 🎉)

**Easy way:** 
```
4.1 When you first use the extension, it'll ask for your token
4.2 Just paste what you copied and you're all set!
```

**Manual way:** 
```
4.1 Open VS Code Settings: Ctrl+, (Windows/Linux) or Cmd+, (Mac)
4.2 Search for "cursor price tracking" 
4.3 Paste your token in the "Session Token" field
```

#### 🤝 **Need Help? We're Here for You!**

<details>
<summary><strong>🔍 Can't find the WorkosCursorSessionToken?</strong></summary>

**Let's troubleshoot together:**

T.1 **Double-check you're logged in**: Go to https://cursor.com/dashboard - you should see your usage data
T.2 **Give it a refresh**: Press F5 on the page and try again
T.3 **Check for filters**: Make sure there are no search filters hiding the cookie
T.4 **Verify the domain**: Look for "https://cursor.com" specifically (not other cursor domains)
T.5 **Fresh start**: Try logging out and back in, then extract the token again

</details>

<details>
<summary><strong>🧐 Token doesn't look right?</strong></summary>

**Here's what to look for:**

- ✅ **Good token**: Long string (100+ characters) starting with letters like `eyJ0eXAiOiJKV1QiLCJhbGciOi...`
- ❌ **Probably wrong**: Short values like `true`, `false`, numbers, or random IDs
- 💡 **Double-check**: Make sure you're copying from "WorkosCursorSessionToken" specifically

</details>

</details>

#### 5️⃣ **🎉 You're All Set!**

Once you've added your token, the extension will start working automatically. You'll see your Cursor usage data in the panel and status bar!

> **🔒 Your Privacy Matters**: Your token stays safely on your computer and is never shared with anyone. We only use it to fetch your personal usage data from Cursor's API.

---

## ⌨️ Available Commands

Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type:

| Command | Description | Shortcut |
|---------|-------------|----------|
| `🔄 Refresh Usage Data` | Update panel with latest usage | Click status bar |
| `⚙️ Configure Session Token` | Set up or update your token | Auto-prompted |
| `🧹 Reset Configuration` | Clear stored token | Settings reset |
| `🔧 Debug API` | Test connectivity & troubleshoot | For support |

## 🛠️ Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `cursorPriceTracking.sessionToken` | Your Cursor session token for API access | `""` |

> **💡 Tip**: Use the markdown description in settings for step-by-step token extraction guide!

## 📊 How to Use

### 🎛️ **Panel View** - Detailed Analytics
1. **Access the Panel**
   ```
   👀 Look for "Cursor Price Tracking" in the bottom panel
   📺 If hidden: View → Panel (or Ctrl+J / Cmd+J)
   ```

2. **Understanding Your Data**
   ```
   📅 Grouped by date for easy tracking
   🏷️  Format: "Model: X tokens | $X.XXXX"
   ⏰ Covers last 24 hours of usage
   🔄 Click refresh icon to update
   ```

3. **Data Breakdown**
   - **Model Types**: Claude, GPT-4, GPT-3.5, etc.
   - **Token Count**: Input + Output + Cache tokens
   - **Cost Classification**: 
     - ✅ **Low** (< $0.20) - Green indicator
     - ⚠️ **Medium** ($0.20-$0.50) - Yellow indicator  
     - 🚨 **High** (> $0.50) - Red indicator
     - 💎 **Pro Plan** - Included usage
     - 🆓 **Free** - No cost

### 📍 **Status Bar** - Quick Overview
```
📍 Location: Bottom-right corner of VS Code
💰 Shows: Current session costs
🖱️  Click: Instant refresh
🏷️  Hover: Detailed tooltip with breakdown
```

## ✨ Key Features

### 📊 **Real-Time Usage Analytics**
- Track your Cursor usage for the last 24 hours
- View detailed token consumption by AI model (Claude, GPT, etc.)
- Monitor session-by-session breakdowns with timestamps

### 💸 **Smart Cost Monitoring**
- Real-time cost calculations with color-coded indicators
- Support for Pro plan inclusion tracking (💎 Included usage)

### 🎯 **Intuitive Interface**
- **Dedicated Panel**: Expandable tree view with detailed usage metrics
- **Status Bar Integration**: Quick cost overview at a glance
- **Auto-Refresh**: Keep data current with one-click refresh

### 🔒 **Privacy First**
- Your session token stays local in VS Code settings
- Direct communication with Cursor's official API only
- No third-party data sharing

## 🚀 Quick Start

### Installation from Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Cursor Usage & Cost Tracker"
4. Click **Install**
5. Follow the setup guide above ⬆️

### Development Installation
1. Clone this repository
2. Open in VS Code
3. Press `F5` to launch Extension Development Host
4. Extension activates automatically


## 🚨 Troubleshooting

<details>
<summary><strong>🔧 Common Issues & Solutions</strong></summary>

### ❌ **"No session token configured"**
**Problem**: Extension can't access Cursor API
**Solutions**:
- ✅ Follow the setup guide above to extract your token
- ✅ Verify token is pasted correctly (no extra spaces)
- ✅ Use the "Configure Session Token" command

### 🌐 **"Error fetching data"**
**Problem**: API request failed
**Solutions**:
- ✅ Check your internet connection
- ✅ Verify you're logged into cursor.com
- ✅ Get a fresh token (old ones expire)
- ✅ Try the "Debug API" command for detailed error info

### 📭 **"No usage data available"**
**Problem**: No recent Cursor activity
**Causes**:
- 🔹 Haven't used Cursor in the last 24 hours
- 🔹 All usage was on free/included plans
- 🔹 Recent API changes (check for extension updates)

### ⏰ **"Token expired" or 401 errors**
**Problem**: Session token is no longer valid
**Solution**:
- ✅ Log out and back into cursor.com
- ✅ Extract a fresh token following the setup guide
- ✅ Session tokens typically expire after a few weeks

### 🐛 **Still having issues?**
1. Enable VS Code Developer Tools: `Help → Toggle Developer Tools`
2. Check the Console for error messages
3. Run the "Debug API" command
4. Report issues with error details at our GitHub repository

</details>

## 🔒 Privacy & Security

<table>
<tr>
<td>🏠</td>
<td><strong>Local Storage</strong></td>
<td>Your session token stays in VS Code settings - never leaves your machine</td>
</tr>
<tr>
<td>🔗</td>
<td><strong>Direct API</strong></td>
<td>Communicates only with Cursor's official API endpoints</td>
</tr>
<tr>
<td>🚫</td>
<td><strong>No Third Parties</strong></td>
<td>Zero data sharing with external services or analytics</td>
</tr>
<tr>
<td>👤</td>
<td><strong>Personal Use Only</strong></td>
<td>Fetches only your own usage data - no access to other accounts</td>
</tr>
</table>

## 🛠️ Development

<details>
<summary><strong>🔨 Building from Source</strong></summary>

### Prerequisites
- Node.js 16+ and npm
- VS Code with TypeScript support

### Setup & Build
```bash
# Clone the repository
git clone https://github.com/Ittipong/cursor-price-tracking.git
cd cursor-price-tracking

# Install dependencies  
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch

# Package extension
npm run install
```

### Testing
- Press `F5` in VS Code to launch Extension Development Host
- The extension will load automatically for testing
- Use Command Palette to test individual commands

</details>

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **🍴 Fork** the repository
2. **🌿 Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **✍️ Make** your changes with clear, tested code
4. **🧪 Test** thoroughly using the Extension Development Host
5. **📝 Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **🚀 Push** to your branch (`git push origin feature/amazing-feature`)
7. **📬 Submit** a Pull Request

### 💡 Ideas for Contributions
- 📊 Additional chart visualizations
- 🎨 Custom theme support  
- 📈 Historical usage trends
- 🌐 Multi-language support

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Important**: Please respect Cursor's Terms of Service when using their API. This extension is for personal usage tracking only.

## 🆘 Support & Community

### Getting Help
1. 📖 **Check the troubleshooting section** above
2. 🔍 **Search existing issues** on GitHub
3. 🐛 **Create a detailed issue** with error logs and steps to reproduce
4. 💬 **Include your VS Code version** and operating system

### Useful Links
- 🐛 [Report Issues](https://github.com/Ittipong/cursor-price-tracking/issues)
- 💡 [Feature Requests](https://github.com/Ittipong/cursor-price-tracking/issues/new)
- 📚 [VS Code Extension Development](https://code.visualstudio.com/api)
- 🏠 [Cursor Official Site](https://cursor.com)

---

### ⭐ Enjoying the Extension?

If this extension helps you track your Cursor costs effectively:
- ⭐ **Star the repository** on GitHub
- 📝 **Leave a review** on the VS Code Marketplace  
- 🗣️ **Share with fellow developers** who use Cursor AI
- 🤝 **Contribute** to make it even better!

---

> **💰 Take control of your AI spending with Cursor Usage & Cost Tracker!**

**Requirements**: Valid Cursor account and session token for API access.