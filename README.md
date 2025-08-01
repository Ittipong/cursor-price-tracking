# Cursor Price Tracking Extension

A VSCode extension that tracks and displays your Cursor AI usage and costs directly in your editor.

## Features

- 📊 **Real-time Usage Tracking**: View your Cursor usage data for the last 24 hours
- 💰 **Cost Monitoring**: Track token consumption and associated costs
- 📅 **Daily Breakdown**: See usage grouped by date with detailed metrics
- 🔄 **Auto Refresh**: Keep your data up-to-date with manual refresh capability
- 📍 **Status Bar**: Quick view of current pricing in the status bar
- 🎛️ **Panel View**: Dedicated panel for detailed usage information

## Installation

1. Clone or download this repository
2. Open the project in VSCode
3. Press `F5` to run the extension in Development Mode
4. The extension will activate automatically

## Setup

### Getting Your Session Token

To access your Cursor usage data, you need to provide your session token:

1. **Open Cursor Dashboard**
   - Go to https://cursor.com/dashboard in your browser
   - Make sure you're logged in

2. **Open Developer Tools**
   - Press `F12` to open Developer Tools
   - Or right-click → "Inspect Element"

3. **Find Your Token**
   - Go to the **"Application"** tab
   - In the left sidebar, expand **"Cookies"**
   - Click on `https://cursor.com`
   - Find the cookie named `WorkosCursorSessionToken`
   - Copy the **Value** of this cookie

4. **Configure the Extension**
   - When you first open the extension, it will prompt for your token
   - Or go to VSCode Settings (`Ctrl+,` / `Cmd+,`)
   - Search for "cursor price tracking"
   - Paste your token in the "Session Token" field

## Usage

### Viewing Usage Data

1. **Open the Panel**
   - Look for the "Cursor Pricing" tab in the bottom panel
   - If not visible, go to View → Panel to show the panel area

2. **View Your Data**
   - The panel shows your usage grouped by date
   - Format: `Date: X tokens | $X.XXXX`
   - Data covers the last 24 hours

3. **Refresh Data**
   - Click the refresh button (🔄) in the panel header
   - Or use the Command Palette: `Ctrl+Shift+P` → "Refresh"

### Status Bar

- Shows current Cursor pricing information
- Located in the bottom-right status bar
- Hover for additional details

## Commands

Access these commands through the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **`cursor-price-tracking.refreshPrices`** - Refresh usage data in the panel view
- **`cursor-price-tracking.refreshStatusBar`** - Refresh status bar data (last 30 minutes)
- **`cursor-price-tracking.setToken`** - Configure your Cursor session token
- **`cursor-price-tracking.clearToken`** - Remove stored session token
- **`cursor-price-tracking.debugApi`** - Test API connectivity and debug issues
- **`cursor-price-tracking.helloWorld`** - Test command for development

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `cursor-price-tracking.sessionToken` | Cursor Usage: Set cookie token | `""` |

## Troubleshooting

### "No session token" Error
- Make sure you've configured your session token in settings
- Verify the token is copied correctly from browser cookies

### "Error fetching data" Message
- Check your internet connection
- Verify your session token is still valid
- Try refreshing your browser session at cursor.com and get a new token

### "No usage data" Message
- This appears if you haven't used Cursor in the last 24 hours
- Or if there are no recorded usage events

### Token Expired
- Session tokens expire after some time
- Get a fresh token from your browser following the setup steps

## Privacy & Security

- Your session token is stored locally in VSCode settings
- No data is sent to third parties
- The extension only communicates with Cursor's official API
- Token is used solely for fetching your personal usage data

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Test the extension
# Press F5 in VSCode to launch Extension Development Host
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and personal use. Please respect Cursor's Terms of Service when using their API.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your session token is valid
3. Check VSCode's Output panel for error details
4. Create an issue with detailed error information

---

**Note**: This extension requires a valid Cursor account and session token to function properly.