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
    static async fetchUsageData(sessionToken) {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const requestData = {
            teamId: 0,
            startDate: last24h.toString(),
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
                return [new PriceItem('No session token', 'Configure in settings')];
            }
            try {
                this.usageData = await ApiService.fetchUsageData(this.sessionToken);
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
                return [new PriceItem('Error fetching data', 'Check token/connection')];
            }
        }
        return [];
    }
    async refresh() {
        await this.loadSessionToken();
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
function activate(context) {
    console.log('Congratulations, your extension "cursor-price-tracking" is now active!');
    // Create status bar item that always shows
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Cursor:100$";
    statusBarItem.tooltip = "Cursor Price - Always Visible";
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.show();
    // Create tree data provider
    const priceDataProvider = new PriceDataProvider();
    const treeView = vscode.window.createTreeView('cursorPrices', {
        treeDataProvider: priceDataProvider
    });
    // Register commands
    const helloWorldCommand = vscode.commands.registerCommand('cursor-price-tracking.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Cursor Price Tracking!');
    });
    const refreshCommand = vscode.commands.registerCommand('cursor-price-tracking.refreshPrices', () => {
        priceDataProvider.refresh();
        vscode.window.showInformationMessage('Cursor prices refreshed!');
    });
    const setTokenCommand = vscode.commands.registerCommand('cursor-price-tracking.setToken', () => {
        priceDataProvider.setToken();
    });
    const clearTokenCommand = vscode.commands.registerCommand('cursor-price-tracking.clearToken', () => {
        priceDataProvider.clearToken();
    });
    const debugApiCommand = vscode.commands.registerCommand('cursor-price-tracking.debugApi', () => {
        priceDataProvider.debugApi();
    });
    context.subscriptions.push(helloWorldCommand);
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(setTokenCommand);
    context.subscriptions.push(clearTokenCommand);
    context.subscriptions.push(debugApiCommand);
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(treeView);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map