import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthorContext } from "../context/AuthorContext";

const AUTHORS_URL = "https://jams-journal-backend.up.railway.app/authors";
const DEFAULT_AVATAR =
  "https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y";

function authorSortKey(a) {
  const last = (a.lastName ?? "").trim().toLowerCase();
  const first = (a.firstName ?? "").trim().toLowerCase();
  const name = (a.name ?? "").trim().toLowerCase();
  if (last || first) return `${last},${first}`;
  return name || "author";
}

const AuthorRow = ({ item, onPress, isFollowing, addFollow, removeFollow }) => {
  const avatar = item.avatar ?? item.photo?.url ?? item.photo;
  const name = [item.firstName, item.lastName].filter(Boolean).join(" ") || "Author";
  const following = isFollowing && isFollowing(item.id);

  const handleFollow = () => {
    if (following) removeFollow(item.id);
    else addFollow(item.id);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.rowMain}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: avatar || DEFAULT_AVATAR }} style={styles.avatar} />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleFollow}
        style={following ? styles.followedBtn : styles.followBtn}
        activeOpacity={0.8}
      >
        <Text style={following ? styles.followedBtnText : styles.followBtnText}>
          {following ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const BrowseAuthors = () => {
  const navigation = useNavigation();
  const { isFollowing, addFollow, removeFollow } = useContext(AuthorContext);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(AUTHORS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data?.authors ?? data?.data ?? [];
        const list = raw.filter((a) => a && (a.id != null || a.firstName != null));
        const sorted = [...list].sort((a, b) => authorSortKey(a).localeCompare(authorSortKey(b)));
        if (!cancelled) setAuthors(sorted);
      } catch (_e) {
        if (!cancelled) setAuthors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ActivityIndicator size="large" color="#357db5" style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={authors}
        keyExtractor={(item) => String(item.id ?? item.email ?? Math.random())}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AuthorRow
            item={item}
            onPress={() => navigation.navigate("Author Details", { item })}
            isFollowing={isFollowing}
            addFollow={addFollow}
            removeFollow={removeFollow}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default BrowseAuthors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontFamily: "sans_semibold",
    fontSize: 14,
    color: "#333",
  },
  followBtn: {
    backgroundColor: "#007caf",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  followBtnText: {
    fontFamily: "sans_bold",
    fontSize: 13,
    color: "#fff",
  },
  followedBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#007caf",
    justifyContent: "center",
    alignItems: "center",
  },
  followedBtnText: {
    fontFamily: "sans_bold",
    fontSize: 13,
    color: "#007caf",
  },
});
