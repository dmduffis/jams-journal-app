import React, { createContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getFollows, addFollow as apiAddFollow, removeFollow as apiRemoveFollow } from "../lib/jamsBackend";

const AuthorContext = createContext();

const AuthorProvider = ({ children }) => {
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [loadingFollows, setLoadingFollows] = useState(true);

  const loadFollows = useCallback(async () => {
    try {
      setLoadingFollows(true);
      const ids = await getFollows();
      setFollowedAuthors(Array.isArray(ids) ? ids : []);
    } catch (e) {
      console.warn("[AuthorContext] Failed to load follows:", e?.message ?? e);
      setFollowedAuthors([]);
    } finally {
      setLoadingFollows(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadFollows();
      } else {
        setFollowedAuthors([]);
        setLoadingFollows(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadFollows();
      else setLoadingFollows(false);
    });
    return () => subscription?.unsubscribe?.();
  }, [loadFollows]);

  const addFollow = useCallback(async (authorId) => {
    const id = String(authorId);
    setFollowedAuthors((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await apiAddFollow(id);
    } catch (e) {
      console.warn("[AuthorContext] addFollow failed:", e?.message ?? e);
      setFollowedAuthors((prev) => prev.filter((x) => x !== id));
    }
  }, []);

  const removeFollow = useCallback(async (authorId) => {
    const id = String(authorId);
    setFollowedAuthors((prev) => prev.filter((x) => x !== id));
    try {
      await apiRemoveFollow(id);
    } catch (e) {
      console.warn("[AuthorContext] removeFollow failed:", e?.message ?? e);
      setFollowedAuthors((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  }, []);

  const value = {
    followedAuthors,
    loadingFollows,
    addFollow,
    removeFollow,
    isFollowing: (authorId) => followedAuthors.includes(String(authorId)),
  };

  return (
    <AuthorContext.Provider value={value}>
      {children}
    </AuthorContext.Provider>
  );
};

export { AuthorContext, AuthorProvider };
