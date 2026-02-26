import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { markNotificationRead } from "../lib/jamsBackend";
import { useNotificationRefresh } from "../context/NotificationRefreshContext";

const DEFAULT_AVATAR =
  "https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y";

const DROPDOWN_WIDTH = 280;
const HEADER_HEIGHT = 120;

const Header = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, loading: notificationsLoading, triggerRefetch } = useNotificationRefresh();
  const [user, setUser] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerBottom = insets.top + HEADER_HEIGHT - 63;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (user) triggerRefetch();
  }, [user, triggerRefetch]);

  const openNotifications = () => {
    setProfileOpen(false);
    setNotificationsOpen(true);
    triggerRefetch();
  };

  const openProfile = () => {
    setNotificationsOpen(false);
    setProfileOpen(true);
  };

  const closeAll = () => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  const handleViewProfile = () => {
    closeAll();
    navigation.navigate("Profile");
  };

  const handleSeeAllNotifications = () => {
    closeAll();
    navigation.navigate("Notifications");
  };

  const handleNotificationPress = async (notification) => {
    closeAll();
    if (notification?.id && !notification?.readAt) {
      try {
        await markNotificationRead(notification.id, true);
        triggerRefetch();
      } catch (_e) {}
    }
    if (notification?.articleId) {
      navigation.navigate("Article", { item: { id: notification.articleId } });
    } else {
      navigation.navigate("Notifications");
    }
  };

  const handleLogout = () => {
    closeAll();
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert("Error", error.message);
        },
      },
    ]);
  };

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  const notificationTimeAgo = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
      if (diffHrs < 24) return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.getFullYear() !== now.getFullYear()
        ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (_e) {
      return "";
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.jams}>jams</Text>

        <View style={styles.rightRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openNotifications}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons name="notifications-outline" color="black" size={22} />
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.profileCircle}
              onPress={openProfile}
              activeOpacity={0.8}
            >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.initialCircle}>
                <Text style={styles.initialText}>{initial}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications dropdown - spacer pushes card right under header */}
      <Modal
        visible={notificationsOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.dropdownBackdrop} onPress={closeAll}>
          <View style={styles.dropdownUnderHeader}>
            <View style={{ height: headerBottom }} />
            <Pressable style={[styles.dropdownCard, styles.dropdownCardAnchored]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Notifications</Text>
            </View>
            {notificationsLoading ? (
              <ActivityIndicator size="small" color="#357db5" style={styles.dropdownLoader} />
            ) : notifications.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No new notifications</Text>
            ) : (
              <ScrollView
                style={styles.dropdownScroll}
                contentContainerStyle={styles.dropdownScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {notifications.map((n) => {
                  const authorName = n.authorName ?? (n.author?.firstName != null
                    ? [n.author?.firstName, n.author?.lastName].filter(Boolean).join(" ")
                    : null) ?? (n.title ?? "New notification");
                  const articleTitle = n.articleTitle ?? n.body ?? null;
                  return (
                    <TouchableOpacity
                      key={n.id}
                      style={styles.dropdownItem}
                      onPress={() => handleNotificationPress(n)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownItemTextWrap}>
                        <Text style={styles.dropdownItemTitle}>
                          {authorName}
                        </Text>
                        {articleTitle ? (
                          <Text style={styles.dropdownItemArticleTitle}>
                            {articleTitle}
                          </Text>
                        ) : null}
                        <Text style={styles.dropdownItemSubtitle}>
                          {notificationTimeAgo(n.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={handleSeeAllNotifications}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownButtonText}>See all</Text>
              <Ionicons name="chevron-forward" size={18} color="#357db5" />
            </TouchableOpacity>
          </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Profile dropdown - spacer pushes card right under header */}
      <Modal
        visible={profileOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAll}
      >
        <Pressable style={styles.dropdownBackdrop} onPress={closeAll}>
          <View style={styles.dropdownUnderHeader}>
            <View style={{ height: headerBottom }} />
            <Pressable style={[styles.dropdownCard, styles.dropdownCardAnchored, styles.profileDropdownCard]} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color="#333" />
              <Text style={styles.dropdownItemLabel}>View profile</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, styles.dropdownItemDanger]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#d9534f" />
              <Text style={[styles.dropdownItemLabel, styles.dropdownItemLabelDanger]}>Logout</Text>
            </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 120,
    paddingHorizontal: 20,
    borderBottomColor: "lightgray",
    borderBottomWidth: 0.5,
    backgroundColor: "#fff",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#d9534f",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: "sans_bold",
    fontSize: 11,
    color: "#fff",
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  initialCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#357db5",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontFamily: "sans_semibold",
    fontSize: 14,
    color: "#fff",
  },
  jams: {
    fontFamily: "basker_bold",
    fontSize: 30,
    color: "#357db5",
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dropdownUnderHeader: {},
  dropdownCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 8,
    maxHeight: 320,
  },
  dropdownCardAnchored: {
    width: DROPDOWN_WIDTH,
    alignSelf: "flex-end",
    marginRight: 16,
  },
  profileDropdownCard: {},
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownScrollContent: {
    paddingBottom: 8,
  },
  dropdownHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  dropdownTitle: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#333",
  },
  dropdownLoader: {
    padding: 24,
  },
  dropdownEmpty: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    padding: 24,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownItemTextWrap: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontFamily: "sans_semibold",
    fontSize: 12,
    color: "#333",
  },
  dropdownItemArticleTitle: {
    fontFamily: "sans_regular",
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  dropdownItemSubtitle: {
    fontFamily: "sans_regular",
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  dropdownItemLabel: {
    fontFamily: "sans_medium",
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  dropdownItemLabelDanger: {
    color: "#d9534f",
  },
  dropdownItemDanger: {},
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  dropdownButtonText: {
    fontFamily: "sans_semibold",
    fontSize: 14,
    color: "#357db5",
  },
});
