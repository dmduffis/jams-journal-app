import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const JOURNALS_URL = "https://jams-journal-backend.up.railway.app/journals";

const JournalCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Image
      source={{ uri: item.coverPhoto || "https://via.placeholder.com/145x220" }}
      style={styles.cover}
    />
    <Text style={styles.title} numberOfLines={2}>
      {item.title}
    </Text>
    <Text style={styles.meta}>
      Vol. {item.issueNumber != null ? item.issueNumber : "—"} {item.year ? `(${item.year})` : ""}
    </Text>
  </TouchableOpacity>
);

const BrowseJournals = () => {
  const navigation = useNavigation();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(JOURNALS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setJournals(list);
      } catch (_e) {
        if (!cancelled) setJournals([]);
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
        data={journals}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <JournalCard
            item={item}
            onPress={() => navigation.navigate("Issue Details", { item })}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default BrowseJournals;

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
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "48%",
  },
  cover: {
    width: "100%",
    aspectRatio: 145 / 220,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontFamily: "sans_medium",
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
  meta: {
    fontFamily: "sans_regular",
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
