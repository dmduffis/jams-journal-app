import { View, StyleSheet, Text, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import BrowseJournals from "./BrowseJournals";
import BrowseAuthors from "./BrowseAuthors";

const TAB_JOURNALS = "journals";
const TAB_AUTHORS = "authors";

const Browse = () => {
  const [activeTab, setActiveTab] = useState(TAB_JOURNALS);
  const { width } = useWindowDimensions();
  const indicatorPos = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(indicatorPos, {
      toValue: activeTab === TAB_JOURNALS ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [activeTab]);

  const indicatorTranslateX = indicatorPos.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2],
  });

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            { width: width / 2, transform: [{ translateX: indicatorTranslateX }] },
          ]}
        />
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab(TAB_JOURNALS)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === TAB_JOURNALS && styles.tabLabelActive]}>
            Journals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
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
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    left: 0,
    bottom: 0,
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
  content: {
    flex: 1,
  },
});
