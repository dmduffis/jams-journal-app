import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import Author from './Author';

const AuthorsRow = () => {

const [authorData, setAuthorData] = useState([]);

const getAuthorData = async () => {
  try {
    const response = await fetch('https://jams-journal-backend.up.railway.app/authors');
    const data = await response.json();
    const featuredAuthors = data.filter(author => author.featured === true);
    setAuthorData(featuredAuthors);
  } catch (error) {
    console.error('Error fetching author data:', error);
  }
}

useEffect(() => {
  getAuthorData();
}, []);

  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Featured Authors</Text>
    <FlatList
    data={authorData}
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
    },
    sectionTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 22,
      marginBottom: 5,
      color: '#357db5',
    }
})