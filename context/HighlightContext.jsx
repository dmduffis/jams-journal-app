import React, { createContext, useCallback, useState } from "react";
import { getHighlights, addHighlight as apiAddHighlight, removeHighlight as apiRemoveHighlight } from "../lib/jamsBackend";

const HighlightContext = createContext(null);

export const HighlightProvider = ({ children }) => {
  const [highlightsByArticle, setHighlightsByArticle] = useState({});
  const [allHighlights, setAllHighlights] = useState([]);

  const fetchForArticle = useCallback(async (articleId) => {
    if (!articleId) return [];
    try {
      const list = await getHighlights(articleId);
      setHighlightsByArticle((prev) => ({ ...prev, [String(articleId)]: list }));
      return list;
    } catch (_e) {
      setHighlightsByArticle((prev) => ({ ...prev, [String(articleId)]: [] }));
      return [];
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const list = await getHighlights();
      setAllHighlights(Array.isArray(list) ? list : []);
      return list;
    } catch (_e) {
      setAllHighlights([]);
      return [];
    }
  }, []);

  const addHighlight = useCallback(
    async (articleId, payload) => {
      const created = await apiAddHighlight(articleId, payload);
      setHighlightsByArticle((prev) => {
        const key = String(articleId);
        const list = prev[key] ?? [];
        return { ...prev, [key]: [...list, created] };
      });
      setAllHighlights((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const removeHighlight = useCallback(async (highlightId, articleId = null) => {
    await apiRemoveHighlight(highlightId);
    setAllHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    if (articleId) {
      setHighlightsByArticle((prev) => {
        const key = String(articleId);
        const list = (prev[key] ?? []).filter((h) => h.id !== highlightId);
        return { ...prev, [key]: list };
      });
    } else {
      setHighlightsByArticle((prev) => {
        const next = {};
        Object.keys(prev).forEach((k) => {
          next[k] = prev[k].filter((h) => h.id !== highlightId);
        });
        return next;
      });
    }
  }, []);

  const getHighlightsForArticle = useCallback(
    (articleId) => highlightsByArticle[String(articleId)] ?? [],
    [highlightsByArticle]
  );

  const value = {
    highlightsByArticle,
    allHighlights,
    fetchForArticle,
    fetchAll,
    addHighlight,
    removeHighlight,
    getHighlightsForArticle,
  };

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
};

export function useHighlights() {
  const ctx = React.useContext(HighlightContext);
  if (!ctx) throw new Error("useHighlights must be used within HighlightProvider");
  return ctx;
}
