import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import TopArticlesItem from "./TopArticlesItem";

const TopArticles = () => {
  const [articleData, setArticleData] = useState([]);

  const getArticleData = async () => {
    try {
      const response = await fetch(
        "https://jams-journal-backend.up.railway.app/articles"
      );
      const data = await response.json();
      const featuredArticles = data.filter(
        (article) => article.featured === true
      );
      setArticleData(featuredArticles);
    } catch (error) {
      console.error("Error fetching article data:", error);
    }
  };

  useEffect(() => {
    getArticleData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Popular Articles</Text>
      <View>
        {articleData.length > 0 ? (
          articleData.slice(0, 5).map((item, idx) => {
            return <TopArticlesItem key={item.id} item={item} idx={idx} />;
          })
        ) : (
          <Text>Come back later for the latest articles</Text>
        )}
      </View>
    </View>
  );
};

export default TopArticles;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 5,
  },
  sectionTitle: {
    fontFamily: "sans_semibold",
    fontSize: 22,
    marginBottom: 5,
    color: "#357db5",
  },
});
