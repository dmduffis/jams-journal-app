import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import TopArticlesItem from './TopArticlesItem';
import { useQuery, gql } from '@apollo/client';

const GET_ARTICLES = gql`
  query {
    articles {
      content {
        text
        markdown
      }
      title
      id
      authors {
        id
        name
        photo {
            url
        }
      }
    }
  }
`;


const TopArticles = () => {

const { loading, error, data } = useQuery(GET_ARTICLES) 

if (loading) return null;
if (error) return `Error! ${error}`;

const articleData = data.articles

  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Popular Articles</Text>
    <View>
    {articleData.slice(0, 5).map((item, idx) => {
        return <TopArticlesItem key={item.id} item={item} idx={idx}/>
    })
    }
  </View>
  </View>
  )
}

export default TopArticles

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginBottom: 5,
        backgroundColor: 'white',
    },
    sectionTitle: {
        fontFamily: 'sans_bold',
        textTransform: 'uppercase',
        fontSize: 13,
        color: '#357db5',
    }
})