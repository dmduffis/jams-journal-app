import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import Issue from './Issue';

const IssuesRow = () => {
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
    <Text style={styles.sectionTitle}>Recent Issues</Text>
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
    sectionTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 22,
      marginBottom: 20,
      color: '#357db5',
    }
})