import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ddsc2026_saved_sessions';

export function useSavedSessions() {
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota or private-browsing errors
    }
  }, [savedIds]);

  const toggleSave = useCallback((sessionId) => {
    setSavedIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);

  const isSaved = useCallback(
    (sessionId) => savedIds.includes(sessionId),
    [savedIds]
  );

  return { savedIds, toggleSave, isSaved };
}
