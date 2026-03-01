import { View, StyleSheet, Text, Platform } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { ApolloProvider } from "@apollo/client";
import client from "./services/ApolloClientSetup";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigation from "./navigation/BottomTabNavigation";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import Home from "./screens/Home";
import AuthorDetails from "./screens/AuthorDetails.jsx";
import Article from "./screens/Article";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState, useRef } from "react";
import IssueDetails from "./screens/IssueDetails.jsx";
import Videos from "./components/VideoSeriesComponent";
import SeriesDetails from "./screens/SeriesDetails.jsx";
import NotificationsScreen from "./screens/Notifications.jsx";
import UserProfile from "./screens/UserProfile.jsx";
import Bookmarks from "./screens/Bookmarks.jsx";
import { AuthorProvider } from "./context/AuthorContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import { HighlightProvider } from "./context/HighlightContext";
import { LikeProvider } from "./context/LikeContext";
import { NotificationRefreshProvider, notificationRefetchTriggerRef } from "./context/NotificationRefreshContext";
import { supabase } from "./lib/supabase";
import { registerPushToken } from "./lib/jamsBackend";
import Auth from "./components/Auth";

const navigationRef = createNavigationContainerRef();

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

  // Register Expo push token with backend when user is logged in
  useEffect(() => {
    if (!session?.user?.id) return;
    let mounted = true;
    (async () => {
      try {
        if (!Device.isDevice) return;
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "JAMS notifications",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#357db5",
          });
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted" || !mounted) return;
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        const options = projectId ? { projectId } : {};
        const { data: token } = await Notifications.getExpoPushTokenAsync(options);
        if (mounted && token) await registerPushToken(token, Platform.OS);
      } catch (_e) {
        // expo-notifications / permission denied / no projectId (e.g. Expo Go)
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  // Handle notification tap: open Article (or Author Details if only authorId)
  const pendingNotificationData = useRef(null);
  const tryNavigateFromNotification = useCallback((data) => {
    if (!data || !navigationRef.isReady()) return;
    const articleId = data.articleId ?? data.article_id;
    const authorId = data.authorId ?? data.author_id;
    if (articleId) {
      navigationRef.navigate("Article", { item: { id: articleId } });
    } else if (authorId) {
      navigationRef.navigate("Author Details", { item: { id: authorId } });
    }
  }, []);

  // When a push is received (e.g. foreground), refresh in-app notification list/badge
  useEffect(() => {
    const subReceived = Notifications.addNotificationReceivedListener(() => {
      notificationRefetchTriggerRef.current?.();
    });
    return () => Notifications.removeNotificationSubscription(subReceived);
  }, []);

  // When user taps a push, navigate and refresh in-app list
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data ?? {};
      pendingNotificationData.current = data;
      tryNavigateFromNotification(data);
      notificationRefetchTriggerRef.current?.();
    });
    return () => Notifications.removeNotificationSubscription(subscription);
  }, [tryNavigateFromNotification]);

  const onNavigationReady = useCallback(() => {
    onLayoutRootView();
    if (pendingNotificationData.current) {
      tryNavigateFromNotification(pendingNotificationData.current);
      pendingNotificationData.current = null;
    }
  }, [tryNavigateFromNotification, onLayoutRootView]);

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
      <BookmarkProvider>
      <HighlightProvider>
      <LikeProvider>
      <NotificationRefreshProvider>
      <ApolloProvider client={client}>
        <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
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
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Profile"
              component={UserProfile}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Bookmarks"
              component={Bookmarks}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
      </NotificationRefreshProvider>
      </LikeProvider>
      </HighlightProvider>
      </BookmarkProvider>
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
