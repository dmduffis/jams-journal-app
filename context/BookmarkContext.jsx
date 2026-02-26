import React, { createContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { getBookmarks, addBookmark as apiAddBookmark, removeBookmark as apiRemoveBookmark } from "../lib/jamsBackend";

const STORAGE_KEY_PREFIX = "@jams_bookmarks_";

const BookmarkContext = createContext(null);

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkMeta, setBookmarkMeta] = useState({});

  const loadBookmarks = useCallback(async () => {
    try {
      const list = await getBookmarks(50);
      const ids = new Set(
        (list || []).map((b) => String(b.articleId ?? b.article?.id ?? "")).filter((id) => id !== "")
      );
      setBookmarkedIds((prev) => new Set([...prev, ...ids]));
    } catch (_e) {
      setBookmarkedIds((prev) => prev);
    }
  }, []);

  useEffect(() => {
    const initAndSync = async (session) => {
      if (!session?.user?.id) return;
      const userId = session.user.id;
      const key = `${STORAGE_KEY_PREFIX}${userId}`;
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const { ids = [], meta = {} } = JSON.parse(raw);
          if (Array.isArray(ids) && ids.length > 0) {
            setBookmarkedIds((prev) => new Set([...prev, ...ids]));
          }
          if (Object.keys(meta).length > 0) {
            setBookmarkMeta((prev) => ({ ...prev, ...meta }));
          }
        }
      } catch (_e) {}
      await loadBookmarks();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) initAndSync(session);
      else {
        setBookmarkedIds(new Set());
        setBookmarkMeta({});
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) initAndSync(session);
    });
    return () => subscription?.unsubscribe?.();
  }, [loadBookmarks]);

  useEffect(() => {
    const persist = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || bookmarkedIds.size === 0) return;
      const key = `${STORAGE_KEY_PREFIX}${session.user.id}`;
      try {
        await AsyncStorage.setItem(
          key,
          JSON.stringify({ ids: [...bookmarkedIds], meta: bookmarkMeta })
        );
      } catch (_e) {}
    };
    persist();
  }, [bookmarkedIds, bookmarkMeta]);

  const isBookmarked = useCallback(
    (articleId) => (articleId != null ? bookmarkedIds.has(String(articleId)) : false),
    [bookmarkedIds]
  );

  const addBookmark = useCallback(
    async (articleId, meta) => {
      const id = String(articleId);
      setBookmarkedIds((prev) => new Set([...prev, id]));
      if (meta && (meta.title != null || meta.slug != null || meta.authors != null)) {
        setBookmarkMeta((prev) => ({ ...prev, [id]: { title: meta.title, slug: meta.slug, authors: meta.authors ?? [] } }));
      }
      try {
        await apiAddBookmark(id);
      } catch (e) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setBookmarkMeta((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        throw e;
      }
    },
    []
  );

  const removeBookmark = useCallback(
    async (articleId) => {
      const id = String(articleId);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setBookmarkMeta((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      try {
        await apiRemoveBookmark(id);
      } catch (e) {
        setBookmarkedIds((prev) => new Set([...prev, id]));
        throw e;
      }
    },
    []
  );

  const toggleBookmark = useCallback(
    async (articleId, meta) => {
      if (articleId == null) return;
      if (bookmarkedIds.has(String(articleId))) await removeBookmark(articleId);
      else await addBookmark(articleId, meta);
    },
    [bookmarkedIds, addBookmark, removeBookmark]
  );

  const value = {
    bookmarkedIds,
    bookmarkMeta,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refetchBookmarks: loadBookmarks,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};

export function useBookmarks() {
  const ctx = React.useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
