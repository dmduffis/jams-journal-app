import React from 'react'
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { Button, StyleSheet, View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GET_ALBUMS = gql`
  query {
    articles {
      content {
        text
      }
      title
      authors {
        name
      }
    }
  }
`;


function Search() {

  const [searchInput, setSearchInput] = useState('');
  const [articleData, setArticleData] = useState([]);

  const {data, loading, error, refetch} = useQuery(GET_ALBUMS)

  if (loading) return <View><Text>Loading</Text></View>;
  if (error) return <View><Text>Bad Error</Text></View>;

  const getSearchResults = () => {
    const results = data.articles.filter((article) => article.content.text.includes(searchInput) || article.title.includes(searchInput))
    console.log(results.map((result) => result.title))
  }

  return (
    <SafeAreaView>
      <Text>Albums</Text>

      <View>
        <TextInput style={styles.input}
          onChangeText={setSearchInput}
          value={searchInput}
          placeholder="Search"
        />
      </View>

      <Button
        title='Search'
        onPress={() => getSearchResults()}
        color='black'
        />
    </SafeAreaView>
  );
}

export default Search;

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});