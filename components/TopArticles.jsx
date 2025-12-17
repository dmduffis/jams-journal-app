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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      // Handle different response structures
      let articlesArray = null;
      
      if (Array.isArray(data)) {
        articlesArray = data;
      } else if (data && Array.isArray(data.articles)) {
        articlesArray = data.articles;
      } else if (data && Array.isArray(data.data)) {
        articlesArray = data.data;
      } else {
        console.warn('Article data is not in expected format:', data);
        setArticleData([]);
        return;
      }
      
      if (!articlesArray || articlesArray.length === 0) {
        setArticleData([]);
        return;
      }
      
      const featuredArticles = articlesArray
        .filter((article) => article && article.featured === true)
        .map((article) => {
          // Normalize authors - extract actual author objects from nested structure
          if (article.authors && Array.isArray(article.authors)) {
            // Authors array contains objects with nested 'author' property
            // Extract the actual author objects and normalize avatar/photo
            article.authors = article.authors
              .map(authorItem => {
                const author = authorItem.author || authorItem;
                if (author) {
                  // Normalize avatar/photo field
                  author.avatar = author.avatar 
                    || author.photo?.url 
                    || (typeof author.photo === 'string' ? author.photo : null);
                }
                return author;
              })
              .filter(author => author); // Remove any null/undefined
          } else if (article.author) {
            // Single author case - normalize avatar/photo
            const author = article.author;
            author.avatar = author.avatar 
              || author.photo?.url 
              || (typeof author.photo === 'string' ? author.photo : null);
            article.authors = [author];
          } else {
            // No authors at all
            article.authors = [];
          }
          return article;
        });
      setArticleData(featuredArticles);
    } catch (error) {
      console.error("Error fetching article data:", error);
      setArticleData([]);
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
