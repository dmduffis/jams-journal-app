import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Author from './Author';
import { useQuery, gql } from '@apollo/client';

const GET_AUTHORS = gql`query {
    authors {
      name
      firstName
      lastName
      featured
      photo {
        url
      }
      id
    }
  }
`

const AuthorsRow = () => {

const { loading, error, data } = useQuery(GET_AUTHORS) 

if (loading) return null;
if (error) return `Error! ${error}`;



  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Featured Authors</Text>
    <FlatList
    data={data.authors.filter((item) => item.featured === true)}
    keyExtractor={item => item.id}
    renderItem={({item}) => 
        (<Author item={item} key={item.id}/>) 
    }
    horizontal
    showsHorizontalScrollIndicator={false}
    removeClippedSubviews={true}
    >
    </FlatList>
    </View>
  )
}

export default AuthorsRow

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        padding: 20,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    sectionTitle: {
        color: 'black',
        fontFamily: 'sans_regular',
        fontSize: 24,
        marginBottom: 10,
    }
})