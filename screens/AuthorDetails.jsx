import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, { Component } from 'react'
import { useRoute } from '@react-navigation/native'
import ArticleComponent from '../components/ArticleComponent';
import { useQuery, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect} from 'react';
import { AuthorContext } from '../context/AuthorContext';


const GET_AUTHOR_RESOURCES = gql`{
  authors {
    id
    lastName
    firstName
    photo {
      url
    }
    articles {
      title
      id
      content {
        markdown
      }
      authors {
        name
        id
        photo {
          url
        }
      }
      journal {
        issue
        year
      }
    }
  }
}
`


const AuthorDetails = ({navigation}) => {


  const route = useRoute({navigation});
  
  const { item } = route.params;

  const { isFollowing, addFollow, removeFollow } = useContext(AuthorContext);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing(item.id)) {
        await removeFollow(item.id);
      } else {
        await addFollow(item.id);
      }
    } catch (_e) {
      // Error already logged in context
    } finally {
      setFollowLoading(false);
    }
  };


  const { loading, error, data } = useQuery(GET_AUTHOR_RESOURCES)

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const issueData = data?.authors?.filter((author) => author.id === item.id) || []

  const articles = (issueData[0]?.articles || []).map((article) => {
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
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <Image style={styles.coverImg} source={{uri: item.avatar || 'https://via.placeholder.com/400x400'}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.firstName} {item.lastName}</Text>
        </View>
        <TouchableOpacity
          onPress={handleFollow}
          style={isFollowing(item.id) ? styles.followedBtn : styles.followBtn}
          disabled={followLoading}
        >
          <View style={styles.follow}>
            <Text style={{ fontFamily: 'sans_bold', fontSize: 15, color: isFollowing(item.id) ? '#007caf' : 'white' }}>
              {followLoading ? "…" : isFollowing(item.id) ? "Following" : "Follow"}
            </Text>
          </View>
        </TouchableOpacity>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {articles && articles.length > 0 ? (
          articles.map((article, index) => {
            return (<TouchableOpacity key={article.id || `author-article-${index}`} onPress={() => navigation.navigate ("Article", {item: article})}>
              <View style={styles.articlesContainer}>
              <View style={styles.articleInfo}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleAuthor}>in Issue {article.journal?.issue || 'N/A'} ({article.journal?.year || 'N/A'})</Text>
              </View>
              <View>
                <Ionicons style={{paddingTop: 15}}
                name='chevron-forward-outline'
                size={12}
                color='gray'
                />
              </View>
              </View>
            </TouchableOpacity>) 
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

export default AuthorDetails

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 50,
  },
  coverImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 75,
},
  detailsContainter: {
    height: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 40,
    height: '100%',
  },
  issueTitleContainer: {
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
  },
  issueTitle: {
    fontFamily: 'sans_bold',
    fontSize: 25,
    paddingBottom: 10,
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
  // articleInfo: {
  //   display: 'flex',
  //   flexBasis: 'auto',
  //   flexDirection: 'column'
  // },
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
    followedBtn: { 
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'white',
      paddingRight: 10,
      paddingLeft: 10,
      paddingTop: 2,
      paddingBottom: 2,
      margin: 5,
      width: 'auto',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#007caf' },
    followBtn: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#007caf',
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 3,
        paddingBottom: 3,
        margin: 5,
        width: 'auto',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 15,}
})