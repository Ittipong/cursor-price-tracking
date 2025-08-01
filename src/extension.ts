import * as vscode from 'vscode';
import * as https from 'https';

interface UsageEvent {
    timestamp: string;
    date: string;
    time: string;
    model: string;
    tokens: number;
    cost: number;
    kind: string;
}

class PriceItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly price: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(label, collapsibleState);
        this.description = this.price;
        this.tooltip = `${this.label} - ${this.price}`;
    }
}

class SessionCard extends vscode.TreeItem {
    constructor(
        public readonly usageEvent: UsageEvent,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        const price = SessionCard.formatCost(usageEvent);
        super(price, collapsibleState);
        
        this.description = `${SessionCard.formatTokens(usageEvent.tokens)} • ${SessionCard.formatTime(usageEvent.timestamp)} • ${SessionCard.formatModelName(usageEvent.model)}`;
        this.tooltip = SessionCard.createTooltip(usageEvent);
        this.iconPath = SessionCard.getStatusIcon(usageEvent);
        this.contextValue = 'session-card';
    }

    private static formatModelName(model: string): string {
        return model
            .replace('claude-4-sonnet', '🧠 Claude 4 Sonnet')
            .replace('claude-3.5-sonnet', '🧠 Claude 3.5 Sonnet')
            .replace('claude-3-haiku', '🧠 Claude 3 Haiku')
            .replace('gpt-4', '🤖 GPT-4')
            .replace('gpt-3.5', '🤖 GPT-3.5');
    }

    private static formatTime(timestamp: string): string {
        return new Date(parseInt(timestamp)).toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    private static formatCost(event: UsageEvent): string {
        const isPro = event.kind.includes('INCLUDED_IN_PRO');
        return isPro ? '💎 Pro Plan' : `💰 $${event.cost.toFixed(3)}`;
    }

    private static formatTokens(tokens: number): string {
        return tokens.toLocaleString() + " tokens";
    }

    private static createTooltip(event: UsageEvent): string {
        const isPro = event.kind.includes('INCLUDED_IN_PRO');
        const costText = isPro ? 'Included in Pro Plan' : `$${event.cost.toFixed(4)}`;
        
        return [
            `🕐 Time: ${SessionCard.formatTime(event.timestamp)}`,
            `💰 Cost: ${costText}`,
            `🔢 Tokens: ${SessionCard.formatTokens(event.tokens)}`,
            `🤖 Model: ${event.model}`,
            `📊 Type: ${event.kind}`
        ].join('\n');
    }

    private static getStatusIcon(event: UsageEvent): vscode.ThemeIcon {
        const isPro = event.kind.includes('INCLUDED_IN_PRO');
        const hasHighCost = event.cost > 0.1;
        
        if (isPro) return new vscode.ThemeIcon('star-full');
        if (hasHighCost) return new vscode.ThemeIcon('warning');
        return new vscode.ThemeIcon('pass');
    }
}

class ApiService {
    private static readonly API_URL = 'https://cursor.com/api/dashboard/get-filtered-usage-events';
    
    static async fetchUsageData(sessionToken: string): Promise<UsageEvent[]> {
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
                            const usageEvents: UsageEvent[] = response.usageEventsDisplay.map((event: any) => {
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
                        } else {
                            resolve([]);
                        }
                    } catch (error) {
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

class PriceDataProvider implements vscode.TreeDataProvider<PriceItem | SessionCard> {
    private _onDidChangeTreeData: vscode.EventEmitter<PriceItem | SessionCard | undefined | null | void> = new vscode.EventEmitter<PriceItem | SessionCard | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PriceItem | SessionCard | undefined | null | void> = this._onDidChangeTreeData.event;
    private usageData: UsageEvent[] = [];
    private sessionToken: string = '';

    constructor() {
        this.loadSessionToken();
    }

    private async loadSessionToken(): Promise<void> {
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

    getTreeItem(element: PriceItem | SessionCard): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PriceItem | SessionCard): Promise<(PriceItem | SessionCard)[]> {
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
                const headerItem = new PriceItem(
                    '📱 Recent Sessions',
                    'Last 24 hours'
                );
                headerItem.iconPath = new vscode.ThemeIcon('history');
                
                const sessionCards = this.usageData
                    .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
                    .slice(0, 20) // Show last 20 sessions
                    .map(event => new SessionCard(event));
                
                return [headerItem, ...sessionCards];
            } catch (error) {
                console.error('Failed to fetch usage data:', error);
                return [new PriceItem('Error fetching data', 'Check token/connection')];
            }
        }
        return [];
    }

    async refresh(): Promise<void> {
        await this.loadSessionToken();
        this._onDidChangeTreeData.fire();
    }

    async setToken(): Promise<void> {
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

    async clearToken(): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to clear the stored token?',
            'Yes',
            'No'
        );
        
        if (confirm === 'Yes') {
            this.sessionToken = '';
            const config = vscode.workspace.getConfiguration('cursor-price-tracking');
            await config.update('sessionToken', '', vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Token cleared successfully!');
            this._onDidChangeTreeData.fire();
        }
    }

    async debugApi(): Promise<void> {
        if (!this.sessionToken) {
            vscode.window.showWarningMessage('No token set. Use "Set Token" command first.');
            return;
        }

        try {
            vscode.window.showInformationMessage('Testing API call... Check VSCode Developer Console for details.');
            const result = await ApiService.fetchUsageData(this.sessionToken);
            vscode.window.showInformationMessage(`API test completed. Found ${result.length} events. Check console for details.`);
        } catch (error) {
            vscode.window.showErrorMessage(`API test failed: ${error}`);
            console.error('API Debug Error:', error);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
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

export function deactivate() {}