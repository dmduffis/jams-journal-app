import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, { Component } from 'react'
import { useRoute } from '@react-navigation/native'
import { useQuery, gql } from '@apollo/client';
import ArticleListItem from '../components/ArticleListItem';
// import { useContext } from 'react';
// import { GlobalContext } from '../context/GlobalContext';


const GET_ISSUE_DETAILS = gql`{
    journals {
      coverPhoto {
        url
      }
      id
      issue
      title
      year
      articles {
        authors {
          id
          name
          photo {
            url
          }
        }
        title
        id
        content {
          markdown
        }
      }
    }
  }
`

export default IssueDetails = ({navigation}) => {


  // const { followedAuthors, following, updateFollowing } = useContext(GlobalContext);

  const route = useRoute({navigation});
  const { item } = route.params;

  const { loading, error, data } = useQuery(GET_ISSUE_DETAILS)

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const issueData = data.journals.filter((journal) => journal.id === item.id)

  const articles = issueData[0].articles

    return (
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <Image style={styles.coverImg} source={{uri: item.coverPhoto.url}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.title}</Text>
        <Text style={styles.issueDetails}>Volume {item.issue}</Text>
        </View>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {articles.map((item) => {
          return (
          <ArticleListItem item={item} key={item.id} />
        ) 
        })}
    </View>
    </View>
      </ScrollView>
    )
}

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
})