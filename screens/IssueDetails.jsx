import { Text, StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ArticleListItem from '../components/ArticleListItem';
import { JAMS_BACKEND_BASE_URL } from '../lib/jamsBackend';

const IssueDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [issueData, setIssueData] = useState(null);
  const { item } = route.params;

  const getIssueDetails = async () => {
    try {
      const response = await fetch(
        `${JAMS_BACKEND_BASE_URL}/journals/${item.id}`
      );
      const data = await response.json();
      
      if (data) {
        setIssueData(data);
      }
    } catch (error) {
      console.error("Error fetching issue details:", error);
    }
  };

  useEffect(() => {
    getIssueDetails();
  }, [item.id]);

  if (!issueData) return null;

  const articles = (Array.isArray(issueData.articles) ? issueData.articles : [])
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

    return (
      <View style={styles.screen}>
        <View style={[styles.backRow, { paddingTop: insets.top + 2, paddingBottom: 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#357db5" />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
        <Image style={styles.coverImg} source={{uri: item.coverPhoto || 'https://via.placeholder.com/400x600'}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.title}</Text>
        <Text style={styles.issueDetails}>Volume {item.issueNumber}</Text>
        </View>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {articles.length > 0 ? (
          articles.map((article, index) => {
            return (
            <ArticleListItem item={article} key={article.id || `article-${index}`} />
          ) 
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles available yet.</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
          </View>
        )}
    </View>
    </View>
      </ScrollView>
      </View>
    );
}

export default IssueDetails

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontFamily: 'sans_semibold',
    fontSize: 17,
    color: '#357db5',
    marginLeft: 2,
  },
  container: {
    paddingTop: 16,
    paddingBottom: 50,
  },
  coverImg: {
    width: 150,
    height: 225,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
  },
  detailsContainter: {
    height: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 30,
    height: '100%',
  },
  issueTitleContainer: {
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 20,
  },
  issueTitle: {
    fontFamily: 'sans_bold',
    fontSize: 24,
    paddingBottom: 3,
    paddingLeft: 30,
    paddingRight: 30,
    textAlign: 'center'
  },
  issueDetails: {
    fontFamily: 'sans_medium',
    fontSize: 14,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    color: 'gray'
  },
  articlesContainer: {
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.2,
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    },
  articleInfo: {
    display: 'flex',
    flexBasis: 'auto',
    flexDirection: 'column'
  },
  articleTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 17,
      paddingTop: 15,
      width: 300,
    },
    articleAuthor: {
      fontFamily: 'sans_medium',
      color: 'gray',
      fontSize: 14,
      paddingTop: 3,
    },
    emptyContainer: {
      paddingTop: 40,
      paddingBottom: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontFamily: 'sans_semibold',
      fontSize: 18,
      color: '#303030',
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtext: {
      fontFamily: 'sans_regular',
      fontSize: 14,
      color: 'gray',
      textAlign: 'center',
    },
})