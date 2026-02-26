import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBookmarks } from "../context/BookmarkContext";
import { useLikes } from "../context/LikeContext";
import { getArticleLikesCount, getArticleBookmarksCount } from "../lib/jamsBackend";
import { formatCount } from "../lib/formatCount";

function authorNames(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return null;
  return authors
    .map((a) => [a.firstName, a.lastName].filter(Boolean).join(" ") || a.name || "Author")
    .filter(Boolean)
    .join(", ");
}

const TopArticlesItem = ({ item, noData, dataExists, idx }) => {
  const navigation = useNavigation();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isLiked, toggleLike } = useLikes();
  const articleId = item?.id;
  const saved = isBookmarked(articleId);
  const liked = isLiked(articleId);
  const authorsText = authorNames(item?.authors);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  useEffect(() => {
    if (!articleId) return;
    getArticleLikesCount(articleId).then((n) => setLikeCount(n));
    getArticleBookmarksCount(articleId).then((n) => setSaveCount(n));
  }, [articleId]);

  const onPressBookmark = async () => {
    if (articleId == null) return;
    const meta = { title: item?.title, slug: item?.slug, authors: item?.authors };
    try {
      await toggleBookmark(articleId, meta);
      const n = await getArticleBookmarksCount(articleId);
      setSaveCount(typeof n === "number" ? n : 0);
    } catch (e) {
      const msg = e?.message ?? "Could not save article";
      Alert.alert("Bookmark", msg === "Not authenticated" ? "Sign in to save articles." : msg);
    }
  };

  const onPressLike = async () => {
    if (articleId != null) {
      await toggleLike(articleId);
      const n = await getArticleLikesCount(articleId);
      setLikeCount(n);
    }
  };

  return (
    <View style={styles.articlesContainer}>
      <View style={styles.mainRow}>
        <TouchableOpacity
          style={styles.textBlock}
          onPress={() => navigation.navigate("Article", { item })}
          activeOpacity={0.7}
        >
          <Text style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.authorNames} numberOfLines={1}>
            {authorsText || " "}
          </Text>
        </TouchableOpacity>
        {articleId != null && (
          <View style={styles.actionStack}>
            <View style={[styles.actionCell, styles.actionCellFirst]}>
              <TouchableOpacity
                onPress={onPressLike}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#e74c3c" : "#357db5"} />
              </TouchableOpacity>
              {likeCount > 0 && <Text style={styles.iconCount}>{formatCount(likeCount)}</Text>}
            </View>
            <View style={styles.actionCell}>
              <TouchableOpacity
                onPress={onPressBookmark}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color="#357db5" />
              </TouchableOpacity>
              {saveCount > 0 && <Text style={styles.iconCount}>{formatCount(saveCount)}</Text>}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default TopArticlesItem

const styles = StyleSheet.create({
  articlesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  actionStack: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 12,
  },
  actionCell: {
    flexDirection: "column",
    alignItems: "center",
    marginLeft: 10,
  },
  actionCellFirst: {
    marginLeft: 0,
  },
  iconButton: {
    padding: 4,
  },
  iconCount: {
    fontFamily: "sans_regular",
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  articleTitle: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#303030",
  },
  authorNames: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
});