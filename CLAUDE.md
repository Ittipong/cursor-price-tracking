# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension called "Cursor Price Tracking" that monitors Cursor AI usage and costs. The extension fetches real-time usage data from Cursor's API and displays it through a tree view panel and status bar integration.

## Development Commands

### Build and Compilation
- `npm run compile` - Compile TypeScript source files to JavaScript in the `out/` directory
- `npm run watch` - Watch for changes and automatically recompile TypeScript files
- `npm run vscode:prepublish` - Prepare extension for publishing (runs compile)

### Testing and Development
- Press `F5` in VSCode to launch Extension Development Host with the extension loaded
- Use Command Palette (`Ctrl+Shift+P`) to test commands
- Extension auto-activates on VSCode startup (`onStartupFinished`)

## Architecture

### Core Components

**Main Classes:**
- `PriceDataProvider` - Tree data provider implementing `vscode.TreeDataProvider` for the pricing panel
- `StatusBarManager` - Manages status bar display with cost information and loading states
- `ApiService` - Handles HTTP requests to Cursor's usage API with session token authentication
- `SessionCard` - Tree item representing individual usage events with rich formatting
- `PriceItem` - Basic tree item for static content and error states

### Data Model

**UsageEvent Interface:**
```typescript
interface UsageEvent {
    timestamp: string;     // Unix timestamp
    date: string;         // Formatted date
    time: string;         // Formatted time
    model: string;        // AI model used (Claude, GPT, etc.)
    tokens: number;       // Total token count
    cost: number;         // Numeric cost value
    costDisplay: string;  // Formatted cost string from API
    kind: string;         // Usage type (INCLUDED_IN_PRO, USAGE, etc.)
}
```

### API Integration

The extension authenticates with Cursor's API using the `WorkosCursorSessionToken` cookie:
- **Endpoint**: `https://cursor.com/api/dashboard/get-filtered-usage-events`
- **Authentication**: Session token passed as Cookie header
- **Data Range**: Configurable (last30m, last24h)
- **Error Handling**: Comprehensive error states with user feedback

### VSCode Extension Integration

**Commands (all registered in package.json):**
- `cursor-price-tracking.refreshPrices` - Refresh panel data
- `cursor-price-tracking.setToken` - Configure session token
- `cursor-price-tracking.clearToken` - Remove stored token
- `cursor-price-tracking.debugApi` - Test API connectivity
- `cursor-price-tracking.refreshStatusBar` - Update status bar data

**UI Components:**
- Tree view in custom panel container (`cursorPricePanel`)
- Status bar item with click-to-refresh functionality
- Rich tooltips with cost categorization and emoji indicators

### State Management

**Configuration:**
- Session token stored in VSCode workspace configuration
- Automatic token prompting on first use
- Global configuration target for persistence

**Status Bar States:**
- Loading (with spinner)
- Active usage (with cost-based color theming)
- Error states (connection/token issues)
- No token configured

### Cost Display Logic

**Cost Categorization:**
- ✅ Low cost: < $0.20 (green theme)
- ⚠️ Medium cost: $0.20-$0.50 (yellow theme)  
- 🚨 High cost: > $0.50 (red theme)
- 💎 Included in Pro plan
- 🆓 Free usage
- ❌ Error/not charged

### Model Recognition

The extension recognizes and formats various AI models:
- Claude models (3 Haiku, 3.5 Sonnet, 4 Sonnet, Opus)
- GPT models (3.5, 4, 4o, 4 Turbo)
- Other models (Gemini, Llama, Mistral, etc.)

## Development Notes

### TypeScript Configuration
- Target: ES2020 with CommonJS modules
- Strict mode enabled for type safety
- Source maps generated for debugging
- Root directory: `src/`, output directory: `out/`

### Extension Lifecycle
- Auto-activation on VSCode startup
- Immediate data fetch on activation
- Proper cleanup with context subscriptions
- Error recovery with status bar feedback

### API Data Processing
- Complex cost parsing from various API response formats
- Token aggregation from multiple sources (cache, input, output tokens)
- Timestamp formatting and sorting
- Robust error handling for API changes