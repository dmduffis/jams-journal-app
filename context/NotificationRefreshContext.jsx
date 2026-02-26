import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { getNotifications } from "../lib/jamsBackend";

const PREVIEW_NOTIFICATIONS = 3;
const NOTIFICATIONS_FOR_BADGE = 50;

const NotificationRefreshContext = createContext(null);

/**
 * Ref so code outside the tree (e.g. App.js push listeners) can trigger a refresh
 * when a push is received. Usage: notificationRefetchTriggerRef.current?.()
 */
export const notificationRefetchTriggerRef = { current: null };

/**
 * Holds notification preview and unread count in one place so all Headers (every tab)
 * show the same badge. Refetch when: push received, user logs in, or dropdown open.
 */
export const NotificationRefreshProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const triggerRefetch = useCallback(async () => {
    const thisFetchId = ++fetchIdRef.current;
    setLoading(true);
    try {
      const list = await getNotifications(NOTIFICATIONS_FOR_BADGE);
      if (thisFetchId !== fetchIdRef.current) return;
      const arr = Array.isArray(list) ? list : [];
      setNotifications(arr.slice(0, PREVIEW_NOTIFICATIONS));
      setUnreadCount(arr.filter((n) => !n.readAt).length);
    } catch (_e) {
      if (thisFetchId !== fetchIdRef.current) return;
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (thisFetchId === fetchIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    notificationRefetchTriggerRef.current = triggerRefetch;
    return () => {
      notificationRefetchTriggerRef.current = null;
    };
  }, [triggerRefetch]);

  // Load notifications as soon as we have a session (so badge shows without opening dropdown)
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) triggerRefetch();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session?.user) triggerRefetch();
    });
    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [triggerRefetch]);

  const value = { notifications, unreadCount, loading, triggerRefetch };

  return (
    <NotificationRefreshContext.Provider value={value}>
      {children}
    </NotificationRefreshContext.Provider>
  );
};

export function useNotificationRefresh() {
  const ctx = React.useContext(NotificationRefreshContext);
  if (!ctx) {
    throw new Error("useNotificationRefresh must be used within NotificationRefreshProvider");
  }
  return ctx;
}
