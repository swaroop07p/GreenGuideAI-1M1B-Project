import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck, Sparkles, RefreshCw, Crown, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const { apiKey, aiStatus, saveApiKey, removeApiKey, refreshAiStatus } = useApp();
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'info', message: '' }
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(apiKey || '');
      setStatus(null);
      refreshAiStatus();
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const trimmed = keyInput.trim();
    setIsTesting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(trimmed ? { 'X-Gemini-API-Key': trimmed } : {})
        },
        body: JSON.stringify({ api_key: trimmed })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setStatus({
            type: 'success',
            message: trimmed 
              ? '✅ Valid Gemini API key! It will dominate over the backend default.'
              : '✅ Backend default Gemini API key is valid and active.'
          });
        } else {
          setStatus({
            type: 'error',
            message: data.message || 'API key verification failed. Please check the key.'
          });
        }
      } else {
        setStatus({
          type: 'error',
          message: `Validation request error (${res.status}).`
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Could not connect to validation service. Please verify network.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (trimmed) {
      saveApiKey(trimmed);
      setStatus({
        type: 'success',
        message: 'Gemini API key saved! Your personal key now takes full dominance over backend keys.'
      });
      if (onKeySaved) onKeySaved(trimmed);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      removeApiKey();
      setStatus({
        type: 'info',
        message: 'Custom key removed. The system now uses the backend default key.'
      });
      if (onKeySaved) onKeySaved('');
    }
  };

  const handleClear = () => {
    removeApiKey();
    setKeyInput('');
    setStatus({
      type: 'info',
      message: 'Custom key removed. System fell back to backend default.'
    });
    if (onKeySaved) onKeySaved('');
  };

  const isCustomActive = Boolean(apiKey && apiKey.trim());
  const isBackendActive = Boolean(aiStatus?.has_backend_key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                Gemini AI Configuration
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Live LLM
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage personal API keys & backend dominance hierarchy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Precedence Hierarchy Indicator */}
          <div className={`p-3 rounded-xl border text-xs ${
            isCustomActive
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : isBackendActive
              ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200'
              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {isCustomActive ? (
                <>
                  <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>👑 Website API Key Active (Dominating Backend Key)</span>
                </>
              ) : isBackendActive ? (
                <>
                  <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>⚡ Default Backend Key Active (.env)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                  <span>⚪ No API Key Active</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isCustomActive
                ? "Your custom API key stored in this browser takes 1st priority for all calculations and chats, strictly dominating over the backend default."
                : isBackendActive
                ? "The application is currently using the backend default Gemini key. Enter your personal key below to override and dominate it."
                : "Enter your Gemini API key below to unlock live AI reasoning and interactive sustainability chat."}
            </p>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
            <p>
              GreenGuide AI uses <strong>Google Gemini (gemini-3.6-flash)</strong> to dynamically analyze carbon footprints and answer complex sustainability questions without pre-canned answers.
            </p>
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                Your key is stored in your browser’s localStorage and sent securely in encrypted headers directly for your session requests.
              </div>
            </div>
          </div>

          {/* Input field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Personal Google Gemini API Key:
              </label>
              {keyInput && (
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Key'}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-mono"
              />
              {keyInput && (
                <button
                  type="button"
                  onClick={() => setKeyInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Status feedback */}
          {status && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
              status.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : status.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : status.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{status.message}</span>
            </div>
          )}

          {/* Links and instructions */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
            <span>Don’t have a Gemini API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Get free key at Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Remove Custom Key
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save & Dominate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
