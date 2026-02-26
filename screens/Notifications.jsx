import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications, markNotificationRead } from "../lib/jamsBackend";

const Notifications = () => {
  const navigation = useNavigation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(20);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "Failed to load notifications");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onPressNotification = async (notification) => {
    if (notification.articleId) {
      navigation.navigate("Article", { item: { id: notification.articleId } });
    }
    if (notification.id && !notification.readAt) {
      try {
        await markNotificationRead(notification.id, true);
        setList((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
        );
      } catch (_e) {}
    }
  };

  const getNotificationDisplay = (n) => {
    const authorName =
      n.authorName ??
      (n.author?.firstName != null
        ? [n.author?.firstName, n.author?.lastName].filter(Boolean).join(" ")
        : null);
    const authorAvatar = n.authorAvatar ?? n.author?.avatar ?? null;
    const articleTitle = n.articleTitle ?? n.body ?? null;
    const primary = authorName ? `${authorName} posted a new article` : (n.title ?? "New article");
    return { authorName, authorAvatar, articleTitle, primary };
  };

  const timeAgo = (isoString) => {
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

  const renderItem = ({ item }) => {
    const isRead = !!item.readAt;
    const { authorName, authorAvatar, articleTitle, primary } = getNotificationDisplay(item);
    const initial = authorName ? authorName.trim().split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase() : "?";
    return (
      <TouchableOpacity
        style={[styles.item, isRead && styles.itemRead]}
        onPress={() => onPressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemAvatar}>
          {authorAvatar ? (
            <Image source={{ uri: authorAvatar }} style={styles.itemAvatarImage} />
          ) : (
            <View style={styles.itemAvatarPlaceholder}>
              <Text style={styles.itemAvatarInitial}>{initial}</Text>
            </View>
          )}
        </View>
        <View style={styles.itemContent}>
          {authorName ? (
            <Text style={styles.itemAuthor}>
              {authorName}
            </Text>
          ) : null}
          {articleTitle ? (
            <Text style={styles.itemTitle}>
              {articleTitle}
            </Text>
          ) : (
            <Text style={styles.itemTitle}>
              {primary}
            </Text>
          )}
          <Text style={styles.itemDate}>{timeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#357db5" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : list.length === 0 ? (
        <Text style={styles.subtitle}>When you follow authors, new article alerts will appear here.</Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      </View>
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backLabel: {
    fontFamily: "sans_semibold",
    fontSize: 17,
    color: "#357db5",
    marginLeft: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontFamily: "sans_bold",
    fontSize: 24,
    color: "#357db5",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#c00",
  },
  listContent: {
    paddingBottom: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  itemRead: {
    opacity: 0.7,
  },
  itemAvatar: {
    marginRight: 12,
  },
  itemAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  itemAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#357db5",
    justifyContent: "center",
    alignItems: "center",
  },
  itemAvatarInitial: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#fff",
  },
  itemContent: {
    flex: 1,
  },
  itemAuthor: {
    fontFamily: "sans_semibold",
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  itemTitle: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  itemBody: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemDate: {
    fontFamily: "sans_regular",
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
});
