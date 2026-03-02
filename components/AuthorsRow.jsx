import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Author from './Author';

const AuthorsRow = () => {
  const navigation = useNavigation();
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
    <View style={styles.titleRow}>
      <Text style={styles.sectionTitle}>Featured Authors</Text>
      <TouchableOpacity
        style={styles.seeAllButton}
        onPress={() => navigation.navigate('Browse')}
        activeOpacity={0.7}
      >
        <Text style={styles.seeAllText}>See all</Text>
        <Ionicons name="chevron-forward" size={18} color="#357db5" />
      </TouchableOpacity>
    </View>
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    sectionTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 22,
      color: '#357db5',
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    seeAllText: {
      fontFamily: 'sans_semibold',
      fontSize: 14,
      color: '#357db5',
      marginRight: 2,
    },
})