import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Mic,
    Bot,
    User,
    Shield,
    ShieldCheck,
    ShieldOff,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Zap,
    Sparkles,
    RefreshCw,
    Info,
    ChevronRight,
    Clock,
    Search,
    Plus,
    Trash2,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Volume2,
    VolumeX,
    Database,
    Lock,
    Wifi,
    Smartphone,
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton,
} from './ui/designSystem';
import { useSecureDroid } from '../hooks/useSecureDroid';
import { SecureDroidNative } from '../services/native/SecureDroidNative';

interface AiAssistantScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'security' | 'privacy' | 'app' | 'network' | 'general' | 'error';
}

// Helper to get app names from package names for display
function getAppName(packageName: string, apps: any[]): string {
    const app = apps.find(a => a.packageName === packageName);
    return app ? app.appName : packageName;
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const { apps, risks, score, hardeningFindings, connected, loading } = useSecureDroid();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your SecureDroid Security Assistant. I can answer questions about your device's security posture, app risks, and recent activity. All answers are based on real data from your device. What would you like to know?",
            timestamp: new Date(),
            type: 'general',
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions] = useState([
        'Why is my security score low?',
        'What are the high-risk apps?',
        'How many apps have dangerous permissions?',
        'What security events happened today?',
        'Is my device encrypted?',
        'Tell me about my security patch status',
        'How many system apps are installed?',
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ---- Real data retrieval functions ----

    const getHighRiskApps = (): any[] => {
        return risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');
    };

    const getMediumRiskApps = (): any[] => {
        return risks.filter(r => r.riskLevel === 'MEDIUM');
    };

    const getTotalRisks = () => risks.length;

    const getDeviceIssues = () => {
        return hardeningFindings.filter(f => f.level === 'WARNING' || f.level === 'CRITICAL');
    };

    // Get recent events (last 24h)
    const getRecentEvents = async () => {
        try {
            const result = await SecureDroidNative.getSecurityLogs(50);
            if (result.success && result.data) {
                const now = Date.now();
                const dayAgo = now - 24 * 60 * 60 * 1000;
                return result.data.filter(e => e.timestamp > dayAgo);
            }
            return [];
        } catch {
            return [];
        }
    };

    // ---- Response generation ----

    const generateResponse = async (userMessage: string): Promise<string> => {
        const lower = userMessage.toLowerCase();

        // Simple keyword matching
        if (lower.includes('score') || lower.includes('security score') || lower.includes('why is my score')) {
            const issues = getDeviceIssues();
            const high = getHighRiskApps().length;
            const medium = getMediumRiskApps().length;
            let details = `Your overall security score is **${score}** out of 100.\n\n`;
            if (high > 0) {
                details += `• ${high} high-risk app${high > 1 ? 's' : ''} detected.\n`;
            }
            if (medium > 0) {
                details += `• ${medium} medium-risk app${medium > 1 ? 's' : ''} detected.\n`;
            }
            if (issues.length > 0) {
                details += `• ${issues.length} device security issue${issues.length > 1 ? 's' : ''} found (${issues.map(i => i.summary).join(', ')}).\n`;
            }
            if (high === 0 && medium === 0 && issues.length === 0) {
                details += '• No significant issues found. Your device is in good shape.\n';
            }
            details += '\n**Recommendation**: ' +
                (high > 0 ? `Review the ${high} high-risk apps first. ` : '') +
                (issues.length > 0 ? 'Address the device security issues. ' : '') +
                'Keep your device updated and review app permissions regularly.';
            return details;
        }

        if (lower.includes('high-risk') || lower.includes('dangerous permissions') || lower.includes('risky app')) {
            const highRisk = getHighRiskApps();
            if (highRisk.length === 0) {
                return 'No high-risk apps were found on your device. All apps appear to have normal permission footprints.';
            }
            let response = `I found **${highRisk.length} high-risk app${highRisk.length > 1 ? 's' : ''}** on your device:\n\n`;
            highRisk.forEach((r, i) => {
                response += `${i+1}. **${r.appName}** (${r.packageName})\n`;
                if (r.findings && r.findings.length > 0) {
                    response += `   - ${r.findings.map(f => f.summary || f.title).join('. ')}\n`;
                }
            });
            response += '\n**Recommendation**: Review these apps and consider removing permissions they don\'t need, or uninstall if they are not trusted.';
            return response;
        }

        if (lower.includes('how many') && (lower.includes('app') || lower.includes('installed'))) {
            const total = apps.length;
            const userApps = apps.filter(a => !a.isSystemApp).length;
            const systemApps = total - userApps;
            return `Your device has **${total}** installed applications.\n- User apps: **${userApps}**\n- System apps: **${systemApps}**\n\n${risks.length > 0 ? `Among them, ${risks.length} have security risks.` : 'All apps appear safe.'}`;
        }

        if (lower.includes('event') || lower.includes('activity') || lower.includes('what happened')) {
            const events = await getRecentEvents();
            if (events.length === 0) {
                return 'No security events were recorded in the last 24 hours. Your device has been quiet.';
            }
            let response = `Here are the recent security events (last 24h):\n\n`;
            events.slice(0, 10).forEach((e) => {
                const time = new Date(e.timestamp).toLocaleTimeString();
                response += `• ${time} – ${e.description || e.category || 'Event'}\n`;
            });
            if (events.length > 10) {
                response += `\n... and ${events.length - 10} more events.`;
            }
            return response;
        }

        if (lower.includes('encrypt') || lower.includes('encryption')) {
            const encrypted = hardeningFindings.some(f => f.id === 'DEVICE_ENCRYPTED');
            if (encrypted) {
                return 'Your device storage is **encrypted**. This means your data is protected if your device is lost or stolen.';
            } else {
                const notEncrypted = hardeningFindings.some(f => f.id === 'DEVICE_NOT_ENCRYPTED');
                if (notEncrypted) {
                    return '⚠️ Your device storage is **not encrypted**. Consider enabling encryption in your device settings (Settings → Security → Encryption) to protect your data.';
                } else {
                    return 'Device encryption status is **unknown**. Android did not provide this information. Please check your device settings manually.';
                }
            }
        }

        if (lower.includes('security patch') || lower.includes('patch')) {
            const patchFinding = hardeningFindings.find(f => f.id === 'SECURITY_PATCH_GOOD' || f.id === 'STALE_SECURITY_PATCH');
            if (patchFinding) {
                return `Security patch status: **${patchFinding.summary}**\n\n${patchFinding.id === 'STALE_SECURITY_PATCH' ? '⚠️ Your security patch may be outdated. Check for system updates.' : '✅ Your security patch is up to date.'}`;
            } else {
                return 'Security patch information is **not available**. Android may not expose this detail on your device.';
            }
        }

        if (lower.includes('system app') || lower.includes('system apps')) {
            const systemApps = apps.filter(a => a.isSystemApp);
            return `Your device has **${systemApps.length}** system apps. These are pre-installed by the manufacturer or Google. They are typically not considered risky, but you can review them in the App Security Auditor if you wish.`;
        }

        if (lower.includes('help') || lower.includes('what can you do') || lower.includes('capabilities')) {
            return 'I can answer questions about:\n' +
                '• Your overall security score\n' +
                '• High-risk apps and their permissions\n' +
                '• Device encryption and security patch status\n' +
                '• Recent security events (app installs, VPN toggles, scans)\n' +
                '• Number of installed apps (user and system)\n' +
                '• Device security issues (USB debugging, developer options, etc.)\n\n' +
                'Just ask me in plain English.';
        }

        // If nothing matches
        return "I'm sorry, I didn't understand that question. You can ask about:\n" +
            "- Your security score\n" +
            "- High-risk apps\n" +
            "- Device encryption\n" +
            "- Security patch\n" +
            "- Recent security events\n" +
            "- Number of installed apps\n" +
            "- Or type 'help' to see all my capabilities.";
    };

    // ---- Send message ----

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const reply = await generateResponse(userMessage.content);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
                type: 'general',
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: 'I encountered an error while fetching your security data. Please try again later.',
                timestamp: new Date(),
                type: 'error',
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // ---- Suggestion click ----
    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion);
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="AI Security Assistant"
                subtitle="Get insights from your device data"
                onBack={onBack}
                isLight={isLight}
            />

            <div className="flex flex-col h-[calc(100vh-180px)]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {message.role === 'assistant' ? (
                                        <Bot className="w-4 h-4 text-sky-400" />
                                    ) : (
                                        <User className="w-4 h-4 text-slate-400" />
                                    )}
                                    <span className="text-xs text-slate-400">
                                        {message.role === 'assistant' ? 'Security Assistant' : 'You'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                    {message.type && message.type !== 'general' && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                                            message.type === 'error'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                            {message.type}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl ${
                                        message.role === 'user'
                                            ? 'bg-sky-500/20 border border-sky-500/30 text-slate-100'
                                            : message.type === 'error'
                                                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                                                : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                                    }`}
                                >
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length < 3 && (
                    <div className="px-4 pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestion(suggestion)}
                                    className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-xs text-slate-300 whitespace-nowrap hover:border-slate-500 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                placeholder="Ask about security..."
                                className="w-full p-3 pr-12 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 text-sm"
                            />
                            <button
                                onClick={() => setInput('')}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors ${input ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 rounded-xl bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        <button className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-500 transition-colors">
                            <Mic className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500 text-center">
                        All answers are based on real data from your device. This is a rule‑based assistant, not generative AI.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantScreen;
