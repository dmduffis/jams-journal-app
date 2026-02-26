import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Header from "../components/Header";
import BrowseJournals from "./BrowseJournals";
import BrowseAuthors from "./BrowseAuthors";

const TAB_JOURNALS = "journals";
const TAB_AUTHORS = "authors";

const Browse = () => {
  const [activeTab, setActiveTab] = useState(TAB_JOURNALS);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_JOURNALS && styles.tabActive]}
          onPress={() => setActiveTab(TAB_JOURNALS)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === TAB_JOURNALS && styles.tabLabelActive]}>
            Journals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === TAB_AUTHORS && styles.tabActive]}
          onPress={() => setActiveTab(TAB_AUTHORS)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === TAB_AUTHORS && styles.tabLabelActive]}>
            Authors
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {activeTab === TAB_JOURNALS ? <BrowseJournals /> : <BrowseAuthors />}
      </View>
    </View>
  );
};

export default Browse;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#357db5",
  },
  tabLabel: {
    fontFamily: "sans_semibold",
    fontSize: 14,
    color: "#666",
  },
  tabLabelActive: {
    color: "#357db5",
  },
  content: {
    flex: 1,
  },
});
