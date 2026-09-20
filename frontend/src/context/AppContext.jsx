import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { apiUrl } from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Theme State: Default explicitly to 'light' mode as requested by the user
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('greenguide_theme');
      // If user previously saved dark/light, respect it; otherwise default strictly to 'light'
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('greenguide_theme', theme);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Unit State (kg / lb)
  const [unit, setUnit] = useState(() => {
    try {
      return localStorage.getItem('greenguide_unit') || 'kg';
    } catch {
      return 'kg';
    }
  });

  const toggleUnit = () => {
    setUnit(prev => {
      const next = prev === 'kg' ? 'lb' : 'kg';
      try {
        localStorage.setItem('greenguide_unit', next);
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  // Clean up any legacy language setting in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('greenguide_lang');
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const t = translations.en || translations;

  // 3. Optional Client-Side Previous Session Comparison (opt-in)
  const [previousSession, setPreviousSession] = useState(() => {
    try {
      const saved = localStorage.getItem('greenguide_previous_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveCurrentSession = (data) => {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        total_monthly_kg: data.total_monthly_kg,
        eco_score: data.eco_score,
        category_breakdown: data.category_breakdown
      };
      localStorage.setItem('greenguide_previous_session', JSON.stringify(snapshot));
      setPreviousSession(snapshot);
    } catch (e) {
      console.warn(e);
    }
  };

  const clearPreviousSession = () => {
    try {
      localStorage.removeItem('greenguide_previous_session');
      setPreviousSession(null);
    } catch (e) {
      console.warn(e);
    }
  };

  // 4. API Key & LLM Precedence Management (Website Settings dominate over Backend .env)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('greenguide_gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const [aiStatus, setAiStatus] = useState({
    configured: false,
    source: 'none', // 'website_settings' | 'backend_env' | 'none'
    has_custom_key: false,
    has_backend_key: false,
    model: 'gemini-3.6-flash'
  });

  const refreshAiStatus = async (keyOverride) => {
    const keyToCheck = keyOverride !== undefined ? keyOverride : (apiKey || '');
    try {
      const headers = {};
      if (keyToCheck && keyToCheck.trim()) {
        headers['X-Gemini-API-Key'] = keyToCheck.trim();
      }
      const res = await fetch(apiUrl('/api/gemini-status'), { headers });
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch AI status:', err);
    }
  };

  useEffect(() => {
    refreshAiStatus(apiKey);
  }, []);

  const saveApiKey = (newKey) => {
    const trimmed = (newKey || '').trim();
    try {
      if (trimmed) {
        localStorage.setItem('greenguide_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('greenguide_gemini_api_key');
      }
      setApiKey(trimmed);
      refreshAiStatus(trimmed);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const removeApiKey = () => {
    saveApiKey('');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        unit,
        toggleUnit,
        t,
        previousSession,
        saveCurrentSession,
        clearPreviousSession,
        apiKey,
        aiStatus,
        refreshAiStatus,
        saveApiKey,
        removeApiKey
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
