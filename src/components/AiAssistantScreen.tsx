
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
    VolumeX
} from 'lucide-react';
import {
    SecureDroidTopBar,
    SecureDroidCard,
    SecureDroidSectionHeader,
    SecureDroidStatusChip,
    SecureDroidButton
} from './ui/designSystem';

interface AiAssistantScreenProps {
    onBack: () => void;
    isLight?: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'security' | 'privacy' | 'app' | 'network' | 'general';
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
    onBack,
    isLight = false,
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your SecureDroid AI Security Assistant. I can help you understand your device's security posture, explain app permissions, and provide recommendations to keep your device secure. What would you like to know?",
            timestamp: new Date(),
            type: 'general'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions] = useState([
        'Why is my security score low?',
        'What apps have high-risk permissions?',
        'How do I enable VPN protection?',
        'Explain device encryption',
        'How to check for malware?',
        'What is USB debugging?'
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                {
                    content: "Based on your device's security scan, I can see that your security score is being affected by a few factors. Let me break them down:\n\n1. **App Permissions**: 3 apps have requested sensitive permissions\n2. **Network Protection**: VPN is currently disabled\n3. **System Updates**: Your security patch is up to date\n\n**Recommendation**: Enable VPN protection and review the apps with sensitive permissions.",
                    type: 'security' as const
                },
                {
                    content: "Here are the apps with high-risk permissions on your device:\n\n• **Facebook** - Camera, Microphone, Location\n• **Instagram** - Camera, Storage\n• **Google Maps** - Location (used frequently)\n\n**Recommendation**: Review these apps and consider removing permissions they don't need. You can do this in your Android Settings > Apps > App Permissions.",
                    type: 'privacy' as const
                },
                {
                    content: "To enable VPN protection:\n\n1. Go to the **Network Protection** tab in the bottom navigation\n2. Tap **Connect VPN**\n3. Grant the VPN permission when prompted\n4. Wait for the connection to establish\n\nYour traffic will then be encrypted and protected from interception on public Wi-Fi networks.",
                    type: 'network' as const
                },
                {
                    content: "Device encryption ensures that your data is unreadable without your device password or PIN. Here's how to check if your device is encrypted:\n\n1. Open Settings\n2. Go to Security & Privacy\n3. Look for **Encryption** or **Encrypt phone**\n\nMost modern Android devices are encrypted by default. Your device is currently encrypted ✅",
                    type: 'security' as const
                }
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: randomResponse.content,
                timestamp: new Date(),
                type: randomResponse.type
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion);
    };

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'security': return 'text-emerald-400 bg-emerald-500/10';
            case 'privacy': return 'text-amber-400 bg-amber-500/10';
            case 'app': return 'text-sky-400 bg-sky-500/10';
            case 'network': return 'text-blue-400 bg-blue-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    return (
        <div className={`min-h-full pb-24 transition-colors ${isLight ? 'bg-zinc-50' : 'bg-slate-950'}`}>
            <SecureDroidTopBar
                title="AI Security Assistant"
                subtitle="Get security insights"
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
                                        {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                    {message.type && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getTypeColor(message.type)}`}>
                                            {message.type}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-sky-500/20 border border-sky-500/30 text-slate-100'
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
                </div>
            </div>
        </div>
    );
};

export default AiAssistantScreen;
