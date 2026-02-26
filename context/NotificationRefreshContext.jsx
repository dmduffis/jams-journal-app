import React, { createContext, useCallback, useEffect, useRef } from "react";

const NotificationRefreshContext = createContext(null);

/**
 * Ref so code outside the tree (e.g. App.js push listeners) can trigger a refresh
 * when a push is received. Usage: notificationRefetchTriggerRef.current?.()
 */
export const notificationRefetchTriggerRef = { current: null };

/**
 * Provides a way to trigger "refresh in-app notifications" from anywhere (e.g. when
 * a push notification is received). Consumers (e.g. Header) register their refetch
 * function; when triggerRefetch() is called (or the ref above), the registered refetch runs.
 */
export const NotificationRefreshProvider = ({ children }) => {
  const refetchRef = useRef(null);

  const registerRefetch = useCallback((fn) => {
    refetchRef.current = fn;
  }, []);

  const triggerRefetch = useCallback(() => {
    refetchRef.current?.();
  }, []);

  useEffect(() => {
    notificationRefetchTriggerRef.current = triggerRefetch;
    return () => {
      notificationRefetchTriggerRef.current = null;
    };
  }, [triggerRefetch]);

  const value = { registerRefetch, triggerRefetch };

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
