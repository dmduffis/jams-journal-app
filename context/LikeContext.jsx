import React, { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getLikes, addLike as apiAddLike, removeLike as apiRemoveLike } from "../lib/jamsBackend";

const LikeContext = createContext(null);

export const LikeProvider = ({ children }) => {
  const [likedIds, setLikedIds] = useState(new Set());

  const loadLikes = useCallback(async () => {
    try {
      const ids = await getLikes(50);
      setLikedIds(new Set(Array.isArray(ids) ? ids.map(String).filter(Boolean) : []));
    } catch (_e) {
      setLikedIds(new Set());
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadLikes();
      else setLikedIds(new Set());
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadLikes();
    });
    return () => subscription?.unsubscribe?.();
  }, [loadLikes]);

  const isLiked = useCallback(
    (articleId) => (articleId != null ? likedIds.has(String(articleId)) : false),
    [likedIds]
  );

  const addLike = useCallback(async (articleId) => {
    const id = String(articleId);
    setLikedIds((prev) => new Set([...prev, id]));
    try {
      await apiAddLike(id);
    } catch (e) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      throw e;
    }
  }, []);

  const removeLike = useCallback(async (articleId) => {
    const id = String(articleId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await apiRemoveLike(id);
    } catch (e) {
      setLikedIds((prev) => new Set([...prev, id]));
      throw e;
    }
  }, []);

  const toggleLike = useCallback(
    async (articleId) => {
      if (articleId == null) return;
      if (likedIds.has(String(articleId))) await removeLike(articleId);
      else await addLike(articleId);
    },
    [likedIds, addLike, removeLike]
  );

  const value = {
    likedIds,
    isLiked,
    addLike,
    removeLike,
    toggleLike,
    refetchLikes: loadLikes,
  };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
};

export function useLikes() {
  const ctx = React.useContext(LikeContext);
  if (!ctx) throw new Error("useLikes must be used within LikeProvider");
  return ctx;
}
