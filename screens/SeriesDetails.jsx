import { Text, StyleSheet, View, Image, ScrollView} from 'react-native'
import React, { Component } from 'react'
import { useRoute } from '@react-navigation/native'
import { useQuery, gql } from '@apollo/client';
import ArticleListItem from '../components/ArticleListItem';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useContext } from 'react';
// import { GlobalContext } from '../context/GlobalContext';


const GET_SERIES_DETAILS = gql`{
    seriesies {
      id
      title
      year
      videos {
        youtubeId
        url
        title
        id
        authors {
          name
          id
        }
      }
    }
  }  
`


export default SeriesDetails = ({navigation}) => {


  // const { followedAuthors, following, updateFollowing } = useContext(GlobalContext);

  const route = useRoute({navigation});
  const { item } = route.params;

  const { loading, error, data } = useQuery(GET_SERIES_DETAILS)

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const seriesData = data.seriesies.filter((series) => series.id === item.id)

  const videos = seriesData[0].videos

    return (
<SafeAreaView style={styles.container}>
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.title}</Text>
        <Text style={styles.issueDetails}>Volume {item.year}</Text>
        </View>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {videos.map((item) => {
          return (
          <ArticleListItem item={item} key={item.id} />
        ) 
        })}
    </View>
    </View>
      </ScrollView>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 50,
    display: 'flex',
    flex: 1
  },
  coverImg: {
    width: 120,
    height: 185,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 75,
},
  detailsContainter: {
    height: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 40,
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