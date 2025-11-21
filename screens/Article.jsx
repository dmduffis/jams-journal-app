import { View, Text, SafeAreaView, FlatList, StyleSheet, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Markdown from 'react-native-markdown-display';
import { useRoute } from '@react-navigation/native';
import ArticleAuthors from '../components/ArticleAuthors';

const Article = () => {
  const [articleData, setArticleData] = useState(null);
  const routes = useRoute();
  const { item } = routes.params;

  const getArticleDetails = async () => {
    try {
      const response = await fetch(
        `https://jams-journal-backend.up.railway.app/articles/${item.id}`
      );
      const data = await response.json();
      
      if (data) {
        setArticleData(data);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  useEffect(() => {
    getArticleDetails();
  }, [item.id]);

  if (!articleData) return null;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} >
      <Text style={styles.title}>{articleData.title}</Text>
      
      <View>
        {/* Handle multiple authors */}
        {articleData.authors && articleData.authors.length > 0 && 
          articleData.authors.map((author) => (
            <ArticleAuthors author={author} key={author.id} />
          ))
        }
        {/* Handle single author */}
        {!articleData.authors && articleData.author && (
          <ArticleAuthors author={articleData.author} />
        )}
      </View>

      <View>
        <Markdown selectable style={styles}>{articleData.content || ''}</Markdown>
      </View>
    </ScrollView>
  )
}

export default Article

const styles = StyleSheet.create({
  container: {
  paddingTop: 100,
  paddingLeft: 20,
  paddingRight: 20,
  marginBottom: 50,
  backgroundColor: '#fff',
  },
  body: {
    fontSize: 16, 
    fontFamily: 'serif_regular',
    lineHeight: 32,
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading1: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading2: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading3: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading4: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
  },
  em: {
    fontFamily: 'serif_italic'
  },
  i: {
    fontFamily: 'serif_italic'
  },
  strong: {
    fontFamily: 'serif_bold'
  },
  blockquote: {
    fontSize: 15,
    backgroundColor: 'none',
    borderLeftWidth: 'none',
    paddingRight: 20,
  },
  ordered_list: {
    marginTop: 10,
  },
  order_list_icon: {
    marginTop: 10,
  }
})
