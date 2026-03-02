import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://flvqnuanthbcwndlibds.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdnFudWFudGhiY3duZGxpYmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTYzMjksImV4cCI6MjA3OTE3MjMyOX0.0ozng9xsIJ_5n4RSUjhD421B4nW6wpuXPn_2RNzUPk4";

let _client = null;

function getClient() {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    if (Platform.OS !== "web") {
      AppState.addEventListener("change", (state) => {
        try {
          if (state === "active") {
            _client.auth.startAutoRefresh();
          } else {
            _client.auth.stopAutoRefresh();
          }
        } catch (_e) {}
      });
    }
  }
  return _client;
}

// Lazy init: create client on first use so AsyncStorage isn't touched during bundle load
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getClient()[prop];
    },
  }
);
