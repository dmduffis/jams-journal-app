import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute } from '@react-navigation/native'
import ArticleListItem from '../components/ArticleListItem';

const IssueDetails = ({navigation}) => {
  const [issueData, setIssueData] = useState(null);
  const route = useRoute({navigation});
  const { item } = route.params;

  const getIssueDetails = async () => {
    try {
      const response = await fetch(
        `https://jams-journal-backend.up.railway.app/journals/${item.id}`
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

  const articles = issueData.articles || []

    return (
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
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
          articles.map((item) => {
            return (
            <ArticleListItem item={item} key={item.id} />
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
    )
}

export default IssueDetails

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 50,
  },
  coverImg: {
    width: 150,
    height: 225,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 85,
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