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
        (<Author item = {item} key={item.id}/>) 
    }
    horizontal
    showsHorizontalScrollIndicator={false}
    removeClippedSubviews={true}
    contentContainerStyle={{columnGap: 10 }}>
    </FlatList>
    </View>
  )
}

export default AuthorsRow

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    sectionTitle: {
        color: 'black',
        fontFamily: 'sans_semibold',
        fontSize: 18,
        marginBottom: 10,
    }
})