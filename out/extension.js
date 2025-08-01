"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const https = require("https");
class PriceItem extends vscode.TreeItem {
    constructor(label, price, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
        this.label = label;
        this.price = price;
        this.collapsibleState = collapsibleState;
        this.description = this.price;
        this.tooltip = `${this.label} - ${this.price}`;
    }
}
class SessionCard extends vscode.TreeItem {
    constructor(usageEvent, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        const price = SessionCard.formatCost(usageEvent);
        super(price, collapsibleState);
        this.usageEvent = usageEvent;
        this.collapsibleState = collapsibleState;
        this.description = `${SessionCard.formatTokens(usageEvent.tokens)} • ${SessionCard.formatTime(usageEvent.timestamp)} • ${SessionCard.formatModelName(usageEvent.model)} • ${usageEvent.kind}`;
        this.tooltip = SessionCard.createTooltip(usageEvent);
        this.iconPath = SessionCard.getStatusIcon(usageEvent);
        this.contextValue = 'session-card';
    }
    static formatModelName(model) {
        const lowerModel = model.toLowerCase();
        // Auto model
        if (lowerModel === 'auto')
            return '🎯 Auto';
        // Claude models
        if (lowerModel.includes('claude')) {
            if (lowerModel.includes('4') && lowerModel.includes('sonnet'))
                return '🧠 Claude 4 Sonnet';
            if (lowerModel.includes('3.5') && lowerModel.includes('sonnet'))
                return '🧠 Claude 3.5 Sonnet';
            if (lowerModel.includes('3') && lowerModel.includes('haiku'))
                return '🧠 Claude 3 Haiku';
            if (lowerModel.includes('3') && lowerModel.includes('opus'))
                return '🧠 Claude 3 Opus';
            return '🧠 ' + model.charAt(0).toUpperCase() + model.slice(1);
        }
        // GPT models
        if (lowerModel.includes('gpt')) {
            if (lowerModel.includes('4o'))
                return '🤖 GPT-4o';
            if (lowerModel.includes('4') && lowerModel.includes('turbo'))
                return '🤖 GPT-4 Turbo';
            if (lowerModel.includes('4'))
                return '🤖 GPT-4';
            if (lowerModel.includes('3.5'))
                return '🤖 GPT-3.5';
            return '🤖 ' + model.toUpperCase();
        }
        // Other models
        if (lowerModel.includes('gemini'))
            return '💎 ' + model.charAt(0).toUpperCase() + model.slice(1);
        if (lowerModel.includes('llama') && lowerModel.includes('code'))
            return '🦙 Code Llama';
        if (lowerModel.includes('llama'))
            return '🦙 ' + model.charAt(0).toUpperCase() + model.slice(1);
        if (lowerModel.includes('mistral'))
            return '🌬️ ' + model.charAt(0).toUpperCase() + model.slice(1);
        if (lowerModel.includes('palm'))
            return '🌴 ' + model.charAt(0).toUpperCase() + model.slice(1);
        if (lowerModel.includes('bard'))
            return '🎭 ' + model.charAt(0).toUpperCase() + model.slice(1);
        if (lowerModel.includes('codex'))
            return '💻 ' + model.charAt(0).toUpperCase() + model.slice(1);
        // Default: capitalize first letter
        return model.charAt(0).toUpperCase() + model.slice(1);
    }
    static formatTime(timestamp) {
        return new Date(parseInt(timestamp)).toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    static formatCost(event) {
        if (typeof event.cost === 'number' && event.cost > 0) {
            if (event.cost < 0.2) {
                return `✅ $${event.cost.toFixed(3)}`;
            }
            else if (event.cost <= 0.5) {
                return `⚠️ $${event.cost.toFixed(3)}`;
            }
            else {
                return `🚨 $${event.cost.toFixed(3)}`;
            }
        }
        else if (event.kind.includes('INCLUDED')) {
            return '💎 Included';
        }
        else if (event.kind.includes('ERRORED_NOT_CHARGED')) {
            return '❌ Error - Not Charged';
        }
        else if (typeof event.cost === 'number' && event.cost == 0) {
            return '🆓 Free';
        }
        else {
            return 'Unknown';
        }
    }
    static formatTokens(tokens) {
        return tokens.toLocaleString() + " tokens";
    }
    static createTooltip(event) {
        const isPro = event.kind.includes('INCLUDED_IN_PRO');
        const costText = isPro ? 'Included in Pro Plan' : `$${event.cost.toFixed(4)}`;
        // Cost status
        let costStatus = '';
        if (typeof event.cost === 'number' && event.cost > 0) {
            if (event.cost < 0.2) {
                costStatus = `✅ Low Cost: $${event.cost.toFixed(3)}`;
            }
            else if (event.cost <= 0.5) {
                costStatus = `⚠️ Medium Cost: $${event.cost.toFixed(3)}`;
            }
            else {
                costStatus = `🚨 High Cost: $${event.cost.toFixed(3)}`;
            }
        }
        else if (event.kind.includes('INCLUDED')) {
            costStatus = '💎 Included in Plan';
        }
        else if (event.kind.includes('ERRORED_NOT_CHARGED')) {
            costStatus = '❌ Error - Not Charged';
        }
        else if (typeof event.cost === 'number' && event.cost === 0) {
            costStatus = '🆓 Free';
        }
        else {
            costStatus = '❓ Unknown Cost';
        }
        return [
            costStatus,
            `🕐 Time: ${SessionCard.formatTime(event.timestamp)}`,
            `🔢 Tokens: ${SessionCard.formatTokens(event.tokens)}`,
            `🤖 Model: ${event.model}`,
            `📊 Type: ${event.kind}`
        ].join('\n');
    }
    static getStatusIcon(event) {
        const isPro = event.kind.includes('INCLUDED_IN_PRO');
        const hasHighCost = event.cost > 0.1;
        if (isPro)
            return new vscode.ThemeIcon('star-full');
        if (hasHighCost)
            return new vscode.ThemeIcon('warning');
        return new vscode.ThemeIcon('pass');
    }
}
class ApiService {
    static async fetchUsageData(sessionToken, timeRange = 'last24h') {
        const now = Date.now();
        const timeOffset = timeRange === 'last30m' ? (30 * 60 * 1000) : (24 * 60 * 60 * 1000);
        const startTime = now - timeOffset;
        const requestData = {
            teamId: 0,
            startDate: startTime.toString(),
            endDate: now.toString(),
            page: 1,
            pageSize: 100
        };
        return new Promise((resolve, reject) => {
            const options = {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'content-type': 'application/json',
                    'origin': 'https://cursor.com',
                    'referer': 'https://cursor.com/dashboard?tab=usage',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    'Cookie': sessionToken
                }
            };
            const req = https.request(this.API_URL, options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.usageEventsDisplay) {
                            const usageEvents = response.usageEventsDisplay.map((event) => {
                                const eventDate = new Date(parseInt(event.timestamp));
                                return {
                                    timestamp: event.timestamp,
                                    date: eventDate.toLocaleDateString(),
                                    time: eventDate.toLocaleTimeString(),
                                    model: event.model || 'Unknown',
                                    tokens: (event.tokenUsage?.inputTokens || 0) + (event.tokenUsage?.outputTokens || 0),
                                    cost: event.tokenUsage?.totalCents ? event.tokenUsage.totalCents / 100 : 0,
                                    kind: event.kind || 'Unknown'
                                };
                            });
                            resolve(usageEvents);
                        }
                        else {
                            resolve([]);
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify(requestData));
            req.end();
        });
    }
}
ApiService.API_URL = 'https://cursor.com/api/dashboard/get-filtered-usage-events';
class PriceDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.usageData = [];
        this.sessionToken = '';
        this.loadSessionToken();
    }
    setStatusBarManager(statusBarManager) {
        this.statusBarManager = statusBarManager;
    }
    async loadSessionToken() {
        const config = vscode.workspace.getConfiguration('cursor-price-tracking');
        this.sessionToken = config.get('sessionToken', '');
        if (!this.sessionToken) {
            const token = await vscode.window.showInputBox({
                prompt: 'Enter your Cursor session token',
                password: true,
                placeHolder: 'WorkosCursorSessionToken value from browser cookies'
            });
            if (token) {
                this.sessionToken = token;
                await config.update('sessionToken', token, vscode.ConfigurationTarget.Global);
            }
        }
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            if (!this.sessionToken) {
                // Update status bar to show no token state
                if (this.statusBarManager) {
                    this.statusBarManager.showNoToken();
                }
                return [new PriceItem('No session token', 'Configure in settings')];
            }
            try {
                this.usageData = await ApiService.fetchUsageData(this.sessionToken, 'last24h');
                // Update status bar with the first item data
                if (this.statusBarManager) {
                    if (this.usageData.length > 0) {
                        // Sort by timestamp to get the most recent item first
                        const sortedData = this.usageData.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
                        const firstItem = sortedData[0];
                        this.statusBarManager.updateCost(firstItem.cost || 0);
                    }
                    else {
                        // No data found, reset loading state and show $0.00
                        this.statusBarManager.updateCost(0);
                    }
                }
                if (this.usageData.length === 0) {
                    return [new PriceItem('No usage data', 'Last 24 hours')];
                }
                // Create iOS-style cards for recent sessions
                const headerItem = new PriceItem('📱 Recent Sessions', 'Last 24 hours');
                headerItem.iconPath = new vscode.ThemeIcon('history');
                const sessionCards = this.usageData
                    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
                    .map(event => new SessionCard(event));
                return [headerItem, ...sessionCards];
            }
            catch (error) {
                console.error('Failed to fetch usage data:', error);
                // Update status bar to show error state
                if (this.statusBarManager) {
                    this.statusBarManager.showError();
                }
                return [new PriceItem('Error fetching data', 'Check token/connection')];
            }
        }
        return [];
    }
    async refresh() {
        await this.loadSessionToken();
        // Directly fetch data and update status bar to ensure it's not stuck on loading
        if (this.statusBarManager) {
            if (!this.sessionToken) {
                this.statusBarManager.showNoToken();
            }
            else {
                try {
                    const usageData = await ApiService.fetchUsageData(this.sessionToken, 'last24h');
                    if (usageData.length > 0) {
                        const sortedData = usageData.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
                        const firstItem = sortedData[0];
                        this.statusBarManager.updateCost(firstItem.cost || 0);
                    }
                    else {
                        this.statusBarManager.updateCost(0);
                    }
                }
                catch (error) {
                    console.error('Failed to refresh status bar:', error);
                    this.statusBarManager.showError();
                }
            }
        }
        this._onDidChangeTreeData.fire();
    }
    async setToken() {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Cursor session token',
            password: true,
            placeHolder: 'WorkosCursorSessionToken value from browser cookies'
        });
        if (token) {
            this.sessionToken = token;
            const config = vscode.workspace.getConfiguration('cursor-price-tracking');
            await config.update('sessionToken', token, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Token saved successfully!');
            this._onDidChangeTreeData.fire();
        }
    }
    async clearToken() {
        const confirm = await vscode.window.showWarningMessage('Are you sure you want to clear the stored token?', 'Yes', 'No');
        if (confirm === 'Yes') {
            this.sessionToken = '';
            const config = vscode.workspace.getConfiguration('cursor-price-tracking');
            await config.update('sessionToken', '', vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Token cleared successfully!');
            this._onDidChangeTreeData.fire();
        }
    }
    async debugApi() {
        if (!this.sessionToken) {
            vscode.window.showWarningMessage('No token set. Use "Set Token" command first.');
            return;
        }
        try {
            vscode.window.showInformationMessage('Testing API call... Check VSCode Developer Console for details.');
            const result = await ApiService.fetchUsageData(this.sessionToken);
            vscode.window.showInformationMessage(`API test completed. Found ${result.length} events. Check console for details.`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`API test failed: ${error}`);
            console.error('API Debug Error:', error);
        }
    }
}
class StatusBarManager {
    constructor(context) {
        this.isLoading = false;
        this.currentCost = 0;
        this.sessionToken = '';
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'cursor-price-tracking.refreshStatusBar';
        this.statusBarItem.tooltip = "Click to refresh Cursor pricing (last 30 minutes)";
        this.statusBarItem.show();
        // Start with loading state instead of $0.00
        this.isLoading = true;
        this.updateDisplay();
        context.subscriptions.push(this.statusBarItem);
    }
    async loadSessionToken() {
        const config = vscode.workspace.getConfiguration('cursor-price-tracking');
        this.sessionToken = config.get('sessionToken', '');
    }
    updateDisplay() {
        if (this.isLoading) {
            this.statusBarItem.text = "$(loading~spin) Cursor: Loading...";
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        }
        else {
            this.statusBarItem.text = `Cursor: $${this.currentCost.toFixed(2)}`;
            this.statusBarItem.backgroundColor = this.currentCost > 1.0
                ? new vscode.ThemeColor('statusBarItem.warningBackground')
                : undefined;
        }
    }
    async refreshData() {
        if (this.isLoading)
            return;
        this.isLoading = true;
        this.updateDisplay();
        try {
            await this.loadSessionToken();
            if (!this.sessionToken) {
                vscode.window.showWarningMessage('No Cursor session token configured. Use "Set Token" command first.');
                this.isLoading = false;
                this.updateDisplay();
                return;
            }
            const usageData = await ApiService.fetchUsageData(this.sessionToken, 'last30m');
            this.currentCost = usageData.reduce((total, event) => total + (event.cost || 0), 0);
            vscode.window.showInformationMessage(`Cursor cost updated: $${this.currentCost.toFixed(2)} (last 30 minutes)`);
        }
        catch (error) {
            console.error('Failed to refresh status bar data:', error);
            vscode.window.showErrorMessage('Failed to refresh Cursor pricing data');
        }
        finally {
            this.isLoading = false;
            this.updateDisplay();
        }
    }
    updateCost(cost) {
        this.isLoading = false; // Reset loading state
        this.currentCost = cost;
        this.updateDisplay();
    }
    showError() {
        this.isLoading = false;
        this.statusBarItem.text = "Cursor: Error";
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        this.statusBarItem.tooltip = "Failed to load Cursor pricing data. Click to retry or configure token.";
    }
    showNoToken() {
        this.isLoading = false;
        this.statusBarItem.text = "Cursor: No Token";
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        this.statusBarItem.tooltip = "No session token configured. Click to configure token.";
    }
}
function activate(context) {
    console.log('Congratulations, your extension "cursor-price-tracking" is now active!');
    // Create status bar manager
    const statusBarManager = new StatusBarManager(context);
    // Create tree data provider
    const priceDataProvider = new PriceDataProvider();
    const treeView = vscode.window.createTreeView('cursorPrices', {
        treeDataProvider: priceDataProvider
    });
    // Connect status bar manager to price data provider
    priceDataProvider.setStatusBarManager(statusBarManager);
    // Register commands
    const helloWorldCommand = vscode.commands.registerCommand('cursor-price-tracking.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Cursor Price Tracking!');
    });
    const refreshCommand = vscode.commands.registerCommand('cursor-price-tracking.refreshPrices', async () => {
        await priceDataProvider.refresh();
        vscode.window.showInformationMessage('Cursor prices refreshed!');
    });
    const refreshStatusBarCommand = vscode.commands.registerCommand('cursor-price-tracking.refreshStatusBar', async () => {
        // Check if we need to configure token first
        const config = vscode.workspace.getConfiguration('cursor-price-tracking');
        const sessionToken = config.get('sessionToken', '');
        if (!sessionToken) {
            // Redirect to token configuration
            await priceDataProvider.setToken();
        }
        else {
            statusBarManager.refreshData();
        }
    });
    const setTokenCommand = vscode.commands.registerCommand('cursor-price-tracking.setToken', async () => {
        await priceDataProvider.setToken();
        statusBarManager.refreshData();
    });
    const clearTokenCommand = vscode.commands.registerCommand('cursor-price-tracking.clearToken', async () => {
        await priceDataProvider.clearToken();
        statusBarManager.updateCost(0);
    });
    const debugApiCommand = vscode.commands.registerCommand('cursor-price-tracking.debugApi', () => {
        priceDataProvider.debugApi();
    });
    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(refreshStatusBarCommand);
    context.subscriptions.push(setTokenCommand);
    context.subscriptions.push(clearTokenCommand);
    context.subscriptions.push(debugApiCommand);
    context.subscriptions.push(treeView);
    // Auto-fetch data when VSCode opens - start immediately
    priceDataProvider.refresh().catch(() => {
        // If initial load fails, show error state in status bar
        statusBarManager.showError();
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map