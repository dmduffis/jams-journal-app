import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import Author from './Author';

const AuthorsRow = () => {

const [authorData, setAuthorData] = useState([]);

const getAuthorData = async () => {
  try {
    const response = await fetch('https://jams-journal-backend.up.railway.app/authors');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text.substring(0, 200));
      throw new Error('Response is not JSON');
    }
    
    const data = await response.json();
    
    // Handle different response structures
    let authorsArray = null;
    
    if (Array.isArray(data)) {
      authorsArray = data;
    } else if (data && Array.isArray(data.authors)) {
      authorsArray = data.authors;
    } else if (data && Array.isArray(data.data)) {
      authorsArray = data.data;
    } else {
      console.warn('Author data is not in expected format:', data);
      setAuthorData([]);
      return;
    }
    
    if (!authorsArray || authorsArray.length === 0) {
      setAuthorData([]);
      return;
    }
    
    const featuredAuthors = authorsArray.filter(author => author && author.featured === true);
    setAuthorData(featuredAuthors);
  } catch (error) {
    console.error('Error fetching author data:', error);
    setAuthorData([]);
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