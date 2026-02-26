import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
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

  const renderItem = ({ item }) => {
    const isRead = !!item.readAt;
    return (
      <TouchableOpacity
        style={[styles.item, isRead && styles.itemRead]}
        onPress={() => onPressNotification(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title ?? "New article"}
        </Text>
        {item.body ? (
          <Text style={styles.itemBody} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text style={styles.itemDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
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
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  itemRead: {
    opacity: 0.7,
  },
  itemTitle: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#333",
  },
  itemBody: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  itemDate: {
    fontFamily: "sans_regular",
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
