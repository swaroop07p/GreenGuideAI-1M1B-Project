import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Sparkles, Bot, User,
  HelpCircle, Copy, Check, RotateCcw, Key, AlertCircle, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiUrl } from '../../utils/api';

// Sanitize raw LaTeX math notations into clean Unicode text (e.g. $\text{CO}_2\text{e}$ -> CO₂e)
function sanitizeLatex(text) {
  if (!text) return '';
  return text
    // Replace standard LaTeX chemical notations
    .replace(/\$\s*\\text\{CO\}_\{?2\}?\\text\{e\}\s*\$/gi, 'CO₂e')
    .replace(/\$\s*\\text\{CO\}_\{?2\}?e\s*\$/gi, 'CO₂e')
    .replace(/\$\s*CO_\{?2\}?e\s*\$/gi, 'CO₂e')
    .replace(/\$\s*\\text\{CO\}_\{?2\}?\s*\$/gi, 'CO₂')
    .replace(/\$\s*CO_\{?2\}?\s*\$/gi, 'CO₂')
    .replace(/\$\s*\\text\{CH\}_\{?4\}?\s*\$/gi, 'CH₄')
    .replace(/\$\s*CH_\{?4\}?\s*\$/gi, 'CH₄')
    .replace(/\$\s*\\text\{N\}_\{?2\}?\\text\{O\}\s*\$/gi, 'N₂O')
    .replace(/\$\s*\\text\{N\}_\{?2\}?O\s*\$/gi, 'N₂O')
    .replace(/\$\s*N_\{?2\}?O\s*\$/gi, 'N₂O')
    // Replace generic \text{...} inside $...$
    .replace(/\$\s*\\text\{([^}]+)\}\s*\$/g, '$1')
    // Replace math subscript syntax like X_{2} or X_2
    .replace(/\$([A-Za-z0-9\s_–—\-+=/\\{}]+)\$/g, (match, p1) => {
      return p1
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/_\{?([0-9])\}?/g, (m, digit) => {
          const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
          return subs[digit] || digit;
        })
        .replace(/\\/g, '');
    });
}

// Rich Markdown and structure formatter for assistant output
function FormattedMessage({ text }) {
  const sanitized = sanitizeLatex(text || '');
  const lines = sanitized.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 ml-4 list-disc space-y-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      inList = false;
      listItems = [];
    }
  };

  const formatInline = (str) => {
    // Bold: **text**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-zinc-900 dark:text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Inline italic: *text*
      const subparts = part.split(/(\*.*?\*)/g);
      return subparts.map((sp, subIndex) => {
        if (sp.startsWith('*') && sp.endsWith('*')) {
          return <em key={`${index}-${subIndex}`}>{sp.slice(1, -1)}</em>;
        }
        return sp;
      });
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for "Key Takeaway:" callout
    if (
      trimmed.toLowerCase().startsWith('key takeaway:') ||
      trimmed.toLowerCase().startsWith('**key takeaway:**') ||
      trimmed.toLowerCase().startsWith('takeaway:')
    ) {
      flushList();
      const content = trimmed.replace(/^(\*\*key takeaway:\*\*|key takeaway:|takeaway:)/i, '').trim();
      elements.push(
        <div 
          key={idx} 
          className="my-3 p-3 sm:p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm shadow-xs flex items-start gap-2.5"
        >
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-emerald-900 dark:text-emerald-100 block sm:inline mr-1">
              Key Takeaway:
            </strong>
            <span>{formatInline(content)}</span>
          </div>
        </div>
      );
    }
    // Check for Analogy Subheader (e.g. "#### The Currency Analogy 💡")
    else if (trimmed.startsWith('#### ') && (trimmed.toLowerCase().includes('analogy') || trimmed.includes('💡'))) {
      flushList();
      const headingText = trimmed.slice(5).trim();
      elements.push(
        <div key={idx} className="mt-3 mb-1.5 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
            {formatInline(headingText)}
          </h4>
        </div>
      );
    }
    // Generic Headings
    else if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h5 key={idx} className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2 mb-1">
          {formatInline(trimmed.slice(5))}
        </h5>
      );
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={idx} className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
    }
    // Standard unordered lists (- or *)
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
    }
    // Colon-based comparison items (e.g. "Methane (CH₄): Traps about...")
    else if (/^[A-Za-z0-9\s()₂₄\-_]+:/.test(trimmed) && (trimmed.includes('(') || trimmed.includes('CO₂') || trimmed.includes('CH₄') || trimmed.includes('N₂O'))) {
      flushList();
      const colonIdx = trimmed.indexOf(':');
      const title = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();
      elements.push(
        <div key={idx} className="my-1.5 pl-3 border-l-2 border-emerald-500/70 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <strong className="font-bold text-zinc-900 dark:text-zinc-100">{title}:</strong>{' '}
          <span>{formatInline(rest)}</span>
        </div>
      );
    }
    // Non-empty paragraphs
    else if (trimmed.length > 0) {
      flushList();
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-1">
          {formatInline(trimmed)}
        </p>
      );
    } else {
      flushList();
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

export default function WhatIfAIChat({ contextData, onOpenApiKeyModal }) {
  const { unit } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 **Hi! I am your GreenGuide AI Sustainability Assistant.**\n\nAsk me about complex terms (like *kg CO2e*, *Scopes*, *Grid factors*), or test what happens if you make specific lifestyle changes (e.g., getting an EV, installing rooftop solar, or going plant-rich)!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // References for container-only scrolling without moving page viewport
  const chatContainerRef = useRef(null);
  const isFirstMount = useRef(true);

  const quickQuestions = [
    "What does kg CO2e mean?",
    "How much do I save with an EV?",
    "What is the Paris 1.5°C target?",
    "Why does grid electricity emit CO2?",
    "Why does landfill food waste cause methane?"
  ];

  // Scroll ONLY inside the messages container on new messages; NEVER scroll the window
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const localKey = localStorage.getItem('greenguide_gemini_api_key') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (localKey.trim()) {
        headers['X-Gemini-API-Key'] = localKey.trim();
      }

      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend,
          context: {
            unit: unit || 'kg',
            display_monthly: unit === 'lb'
              ? `${(Math.round((contextData?.total_monthly_kg || 0) * 2.20462 * 10) / 10).toLocaleString()} lb CO2e`
              : `${(Math.round((contextData?.total_monthly_kg || 0) * 10) / 10).toLocaleString()} kg CO2e`,
            display_annual: unit === 'lb'
              ? `${(Math.round((contextData?.total_monthly_kg || 0) * 12 * 2.20462 * 10) / 10).toLocaleString()} lb CO2e`
              : `${(Math.round((contextData?.total_monthly_kg || 0) * 12 / 1000 * 100) / 100).toLocaleString()} tonnes CO2e`,
            total_monthly_kg: contextData?.total_monthly_kg,
            eco_score: contextData?.eco_score,
            eco_tier: contextData?.eco_tier,
            category_breakdown: contextData?.category_breakdown
          },
          history: messages.slice(-4)
        })
      });

      if (!response.ok) {
        throw new Error(`Chat error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          suggestions: data.suggestions || [],
          source: data.source
        }
      ]);
    } catch (err) {
      console.warn("Chat assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "### ⚠️ Unable to Connect\n\nCould not reach the live Gemini AI assistant. Please check that the backend server is running and your network connection is active.",
          suggestions: ["What is kg CO2e?", "What is the Paris 1.5°C target?"],
          source: "error"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! Ask any question about sustainability, emissions notations, or what-if lifestyle scenarios."
      }
    ]);
  };

  return (
    <div className="mt-8 rounded-3xl border border-emerald-200/70 dark:border-emerald-900/60 bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-zinc-900 dark:via-emerald-950/20 dark:to-zinc-900 shadow-sm overflow-hidden transition-all">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-200/70 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                AI Sustainability Assistant & Notation Clarifier
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Gemini LLM
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ask anything about carbon notations (e.g. kg CO2e) or test what-if scenarios in real time
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear Chat History"
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Question Chips */}
      <div className="px-4 sm:px-6 pt-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 flex items-center gap-1 mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" /> Quick questions:
        </span>
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream (contained scrollable div, NOT the window) */}
      <div 
        ref={chatContainerRef}
        className="p-4 sm:p-6 max-h-96 overflow-y-auto space-y-4 scroll-smooth"
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isApiKeyNeeded = msg.source === 'api_key_required';

          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : isApiKeyNeeded
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-2xs'
                    : 'bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-2xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <FormattedMessage text={msg.content} />

                    {/* Interactive button to open API key modal directly from chat bubble */}
                    {isApiKeyNeeded && onOpenApiKeyModal && (
                      <div className="mt-3 pt-2 border-t border-amber-200/80 dark:border-amber-800/60">
                        <button
                          type="button"
                          onClick={onOpenApiKeyModal}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Configure Gemini API Key</span>
                        </button>
                      </div>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.content, index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Dynamic Follow-up Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sugg, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(sugg)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 cursor-pointer transition-colors"
                          >
                            ↳ {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-500 rounded-tl-xs flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              <span>Analyzing with Gemini LLM in real-time...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about notations (e.g. 'What is kg CO2e?') or lifestyle changes..."
          disabled={isLoading}
          className="flex-1 min-h-[44px] px-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
