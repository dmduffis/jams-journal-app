import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useBookmarks } from "../context/BookmarkContext";
import { getBookmarks } from "../lib/jamsBackend";
import { formatCount } from "../lib/formatCount";

const Bookmarks = () => {
  const navigation = useNavigation();
  const { bookmarkedIds, bookmarkMeta } = useBookmarks();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookmarks(50);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message ?? "Failed to load saved articles");
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

  const displayList = useMemo(() => {
    const fromServer = Array.isArray(list) ? list : [];
    const serverIds = new Set(fromServer.map((b) => String(b.articleId ?? b.article?.id ?? "")).filter(Boolean));
    const meta = bookmarkMeta ?? {};
    const placeholders = [...bookmarkedIds].filter((id) => id && !serverIds.has(String(id))).map((id) => {
      const m = meta[id];
      return {
        articleId: id,
        article: {
          id,
          title: m?.title ?? "Saved article",
          slug: m?.slug ?? null,
          authors: Array.isArray(m?.authors) ? m.authors : [],
        },
      };
    });
    return [...placeholders, ...fromServer];
  }, [list, bookmarkedIds, bookmarkMeta]);

  const authorNames = (authors) => {
    if (!Array.isArray(authors) || authors.length === 0) return null;
    return authors
      .map((a) => [a.firstName, a.lastName].filter(Boolean).join(" ") || a.name || "Author")
      .filter(Boolean)
      .join(", ");
  };

  const renderItem = ({ item: bookmark }) => {
    const art = bookmark.article ?? {};
    const title = art.title ?? "Untitled";
    const slug = art.slug ?? null;
    const authors = authorNames(art.authors);
    const articleItem = art.id ? { id: art.id, title: art.title, slug: art.slug } : { id: bookmark.articleId };

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("Article", { item: articleItem })}
        activeOpacity={0.7}
      >
        <Text style={styles.itemTitle}>{title}</Text>
        {slug ? <Text style={styles.itemSlug}>{slug}</Text> : null}
        {authors ? <Text style={styles.itemAuthors}>{authors}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.backRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Saved articles{!loading && displayList.length > 0 ? ` (${formatCount(displayList.length)})` : ""}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#357db5" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : displayList.length === 0 ? (
          <Text style={styles.emptyText}>No saved articles yet. Tap the bookmark on any article to save it.</Text>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={(b) => String(b.articleId ?? b.article?.id ?? b.createdAt ?? Math.random())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Bookmarks;

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
  emptyText: {
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  itemTitle: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  itemSlug: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  itemAuthors: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#999",
  },
});
