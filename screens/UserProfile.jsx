import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { AuthorContext } from "../context/AuthorContext";
import { useBookmarks } from "../context/BookmarkContext";
import { getBookmarks } from "../lib/jamsBackend";

const AUTHORS_URL = "https://jams-journal-backend.up.railway.app/authors";
const DEFAULT_AVATAR =
  "https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y";

const TAB_FOLLOWING = "following";
const TAB_SAVED = "saved";

const UserProfile = () => {
  const navigation = useNavigation();
  const { followedAuthors, loadingFollows } = useContext(AuthorContext);
  const { bookmarkedIds, bookmarkMeta } = useBookmarks();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_FOLLOWING);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [bookmarksList, setBookmarksList] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (followedAuthors.length === 0) {
      setFollowingList([]);
      setLoadingFollowing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingFollowing(true);
      try {
        const res = await fetch(AUTHORS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data?.authors ?? data?.data ?? [];
        const ids = new Set(followedAuthors.map((id) => String(id)));
        const list = raw
          .filter((a) => a && ids.has(String(a.id)))
          .map((a) => ({
            ...a,
            avatar: a.avatar ?? a.photo?.url ?? a.photo,
          }));
        if (!cancelled) setFollowingList(list);
      } catch (_e) {
        if (!cancelled) setFollowingList([]);
      } finally {
        if (!cancelled) setLoadingFollowing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [followedAuthors]);

  const loadBookmarks = useCallback(async () => {
    setLoadingBookmarks(true);
    try {
      const data = await getBookmarks(50);
      setBookmarksList(Array.isArray(data) ? data : []);
    } catch (_e) {
      setBookmarksList([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === TAB_SAVED) loadBookmarks();
  }, [activeTab, loadBookmarks]);

  const displayBookmarksList = useMemo(() => {
    const fromServer = Array.isArray(bookmarksList) ? bookmarksList : [];
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
  }, [bookmarksList, bookmarkedIds, bookmarkMeta]);

  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "User";

  const authorNames = (authors) => {
    if (!Array.isArray(authors) || authors.length === 0) return null;
    return authors
      .map((a) => [a.firstName, a.lastName].filter(Boolean).join(" ") || a.name || "Author")
      .filter(Boolean)
      .join(", ");
  };

  const handleLogout = () => {
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

  const renderBookmarkItem = ({ item: bookmark }) => {
    const art = bookmark.article ?? {};
    const title = art.title ?? "Untitled";
    const slug = art.slug ?? null;
    const authors = authorNames(art.authors);
    const articleItem = art.id ? { id: art.id, title: art.title, slug: art.slug } : { id: bookmark.articleId };

    return (
      <TouchableOpacity
        style={styles.bookmarkItem}
        onPress={() => navigation.navigate("Article", { item: articleItem })}
        activeOpacity={0.7}
      >
        <Text style={styles.bookmarkItemTitle}>{title}</Text>
        {slug ? <Text style={styles.bookmarkItemSlug}>{slug}</Text> : null}
        {authors ? <Text style={styles.bookmarkItemAuthors}>{authors}</Text> : null}
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <Image source={{ uri: avatarUrl || DEFAULT_AVATAR }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>{displayName}</Text>
        {user?.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
      </View>

      <View style={styles.tabBar}>
        <View
          style={[
            styles.tabIndicator,
            { left: activeTab === TAB_FOLLOWING ? 0 : "50%" },
          ]}
        />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab(TAB_FOLLOWING)}
          activeOpacity={0.8}
        >
          <View style={styles.tabRow}>
            <Text style={[styles.tabLabel, activeTab === TAB_FOLLOWING && styles.tabLabelActive]}>
              Following
            </Text>
            {followingList.length > 0 && (
              <View style={styles.tabCountPill}>
                <Text style={[styles.tabCount, activeTab === TAB_FOLLOWING && styles.tabCountActive]}>
                  {followingList.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab(TAB_SAVED)}
          activeOpacity={0.8}
        >
          <View style={styles.tabRow}>
            <Text style={[styles.tabLabel, activeTab === TAB_SAVED && styles.tabLabelActive]}>
              Bookmarks
            </Text>
            {displayBookmarksList.length > 0 && (
              <View style={styles.tabCountPill}>
                <Text style={[styles.tabCount, activeTab === TAB_SAVED && styles.tabCountActive]}>
                  {displayBookmarksList.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === TAB_FOLLOWING ? (
          <ScrollView
            style={styles.tabScroll}
            contentContainerStyle={styles.tabScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loadingFollows || loadingFollowing ? (
              <ActivityIndicator size="small" color="#357db5" style={styles.loader} />
            ) : followingList.length === 0 ? (
              <Text style={styles.emptyText}>
                You’re not following any authors yet. Follow authors from the Home screen or their profile.
              </Text>
            ) : (
              followingList.map((author) => (
                <TouchableOpacity
                  key={String(author.id)}
                  style={styles.authorRow}
                  onPress={() => navigation.navigate("Author Details", { item: author })}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: author.avatar || DEFAULT_AVATAR }} style={styles.avatar} />
                  <Text style={styles.authorName}>
                    {[author.firstName, author.lastName].filter(Boolean).join(" ") || "Author"}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        ) : (
          loadingBookmarks ? (
            <View style={styles.tabScrollContent}>
              <ActivityIndicator size="small" color="#357db5" style={styles.loader} />
            </View>
          ) : displayBookmarksList.length === 0 ? (
            <View style={styles.tabScrollContent}>
              <Text style={styles.emptyText}>
                No saved articles yet. Tap the bookmark on any article to save it.
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayBookmarksList}
              keyExtractor={(b) => String(b.articleId ?? b.article?.id ?? b.createdAt ?? Math.random())}
              renderItem={renderBookmarkItem}
              contentContainerStyle={styles.bookmarkListContent}
              style={styles.tabScroll}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  logoutButton: {
    paddingRight: 8,
  },
  logoutLabel: {
    fontFamily: "sans_semibold",
    fontSize: 17,
    color: "#357db5",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
  },
  profileName: {
    fontFamily: "sans_bold",
    fontSize: 22,
    color: "#333",
    textAlign: "center",
  },
  profileEmail: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: 3,
    backgroundColor: "#357db5",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: "sans_semibold",
    fontSize: 14,
    color: "#666",
  },
  tabLabelActive: {
    color: "#357db5",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabCountPill: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#357db5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tabCount: {
    fontFamily: "sans_semibold",
    fontSize: 12,
    color: "#357db5",
  },
  tabCountActive: {
    color: "#357db5",
  },
  tabContent: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginVertical: 12,
  },
  emptyText: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorName: {
    fontFamily: "sans_medium",
    fontSize: 16,
    color: "#333",
  },
  bookmarkListContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bookmarkItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  bookmarkItemTitle: {
    fontFamily: "sans_semibold",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  bookmarkItemSlug: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  bookmarkItemAuthors: {
    fontFamily: "sans_regular",
    fontSize: 13,
    color: "#999",
  },
});
