import { View, StyleSheet, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ApolloProvider } from "@apollo/client";
import client from "./services/ApolloClientSetup";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigation from "./navigation/BottomTabNavigation";
import { useFonts } from "expo-font";
import Home from "./screens/Home";
import AuthorDetails from "./screens/AuthorDetails.jsx";
import Article from "./screens/Article";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import IssueDetails from "./screens/IssueDetails.jsx";
import Videos from "./components/VideoSeriesComponent";
import SeriesDetails from "./screens/SeriesDetails.jsx";
import Notifications from "./screens/Notifications.jsx";
import { AuthorProvider } from "./context/AuthorContext";
import { supabase } from "./lib/supabase";
import { registerPushToken } from "./lib/jamsBackend";
import Auth from "./components/Auth";

SplashScreen.preventAutoHideAsync();

class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[App ErrorBoundary]", error?.message ?? error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ fontFamily: "sans_semibold", fontSize: 16, color: "#333", textAlign: "center" }}>
            Something went wrong. Check the Metro/console logs for the actual error.
          </Text>
          <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            {this.state.error?.message ?? String(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [fontsLoaded] = useFonts({
    serif_light: require("./assets/fonts/IBMPlexSerif-Light.ttf"),
    serif_medium: require("./assets/fonts/IBMPlexSerif-Medium.ttf"),
    serif_regular: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    serif_semibold: require("./assets/fonts/IBMPlexSerif-SemiBold.ttf"),
    serif_bold: require("./assets/fonts/IBMPlexSerif-Bold.ttf"),
    serif_italic: require("./assets/fonts/IBMPlexSerif-Italic.ttf"),
    serif_thin: require("./assets/fonts/IBMPlexSerif-Thin.ttf"),
    sans_light: require("./assets/fonts/IBMPlexSans-Light.ttf"),
    sans_medium: require("./assets/fonts/IBMPlexSans-Medium.ttf"),
    sans_regular: require("./assets/fonts/IBMPlexSans-Regular.ttf"),
    sans_semibold: require("./assets/fonts/IBMPlexSans-SemiBold.ttf"),
    sans_thin: require("./assets/fonts/IBMPlexSans-Thin.ttf"),
    sans_bold: require("./assets/fonts/IBMPlexSans-Bold.ttf"),
    basker_italic: require("./assets/fonts/LibreBaskerville-Italic.ttf"),
    basker_regular: require("./assets/fonts/LibreBaskerville-Regular.ttf"),
    basker_bold: require("./assets/fonts/LibreBaskerville-Bold.ttf"),
  });

  // Check for existing session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Optional: register Expo push token with backend when user is logged in
  useEffect(() => {
    if (!session?.user?.id) return;
    let mounted = true;
    (async () => {
      try {
        const Notifications = require("expo-notifications");
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted" || !mounted) return;
        const { data: token } = await Notifications.getExpoPushTokenAsync();
        if (mounted && token) await registerPushToken(token, Platform.OS);
      } catch (_e) {
        // expo-notifications not installed or permission denied
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Show auth screen if not logged in
  if (!session) {
    return (
      <AppErrorBoundary>
        <Auth />
      </AppErrorBoundary>
    );
  }

  // Show main app if logged in
  return (
    <AppErrorBoundary>
    <AuthorProvider>
      <ApolloProvider client={client}>
        <NavigationContainer onReady={onLayoutRootView}>
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigation}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Author Details"
              component={AuthorDetails}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Article"
              component={Article}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Issue Details"
              component={IssueDetails}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Videos"
              component={Videos}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Series Details"
              component={SeriesDetails}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
    </AuthorProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
