import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Issue from './Issue';

const IssuesRow = () => {
  const navigation = useNavigation();
  const [issueData, setIssueData] = useState([]);

  const getIssueData = async () => {
    try {
      const response = await fetch(
        "https://jams-journal-backend.up.railway.app/journals"
      );
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const issuesWithoutFirst = data.slice(1, 7);
        setIssueData(issuesWithoutFirst);
      } else {
        setIssueData([]);
      }
    } catch (error) {
      console.error("Error fetching journal data:", error);
      setIssueData([]);
    }
  };

  useEffect(() => {
    getIssueData();
  }, []);

  return (
    <View style={styles.container}>
    <View style={styles.titleRow}>
      <Text style={styles.sectionTitle}>Recent Issues</Text>
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
    data={issueData}
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
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