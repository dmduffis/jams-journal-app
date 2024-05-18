import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Issue from './Issue';
import { useQuery, gql } from '@apollo/client';

const GET_JOURNALS = gql`query {
    journals {
      coverPhoto {
        url
      }
      id
      issue
      title
      year
    }
  }
  `

const IssuesRow = () => {

const { loading, error, data } = useQuery(GET_JOURNALS) 

if (loading) return null;
if (error) return `Error! ${error}`;

  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Recent Issues</Text>
    <FlatList
    data={data.journals.filter((item) => item.issue !== '1.1' && item.issue !== '19.2')}
    keyExtractor={item => item.id}
    renderItem={({item}) => 
        (<Issue item = {item} key={item.id}/>) 
    }
    horizontal
    showsHorizontalScrollIndicator={false}
    removeClippedSubviews={true}
    contentContainerStyle={{columnGap: 10 }}>
    </FlatList>
    </View>
  )
}

export default IssuesRow

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderBottomLeftRadius: 30,
    },
    sectionTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 22,
      marginBottom: 20,
      color: '#357db5',
    }
})