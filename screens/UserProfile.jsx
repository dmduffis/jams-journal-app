import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { AuthorContext } from "../context/AuthorContext";

const AUTHORS_URL = "https://jams-journal-backend.up.railway.app/authors";
const DEFAULT_AVATAR =
  "https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y";

const UserProfile = () => {
  const navigation = useNavigation();
  const { followedAuthors, loadingFollows } = useContext(AuthorContext);
  const [user, setUser] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

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

  const handleSignOut = async () => {
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
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "User";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
        <Image
          source={{ uri: avatarUrl || DEFAULT_AVATAR }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>{displayName}</Text>
        {user?.email ? (
          <Text style={styles.profileEmail}>{user.email}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Following</Text>
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
              <Image
                source={{ uri: author.avatar || DEFAULT_AVATAR }}
                style={styles.avatar}
              />
              <Text style={styles.authorName}>
                {[author.firstName, author.lastName].filter(Boolean).join(" ") || "Author"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 28,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "sans_semibold",
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  emptyText: {
    fontFamily: "sans_regular",
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
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
  signOutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
  },
  signOutText: {
    color: "#fff",
    fontFamily: "sans_semibold",
    fontSize: 16,
  },
});
