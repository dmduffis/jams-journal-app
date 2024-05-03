import React from 'react'
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { Button, StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GET_ALBUMS = gql`
  query {
    articles {
      content {
        text
      }
      title
      id
      authors {
        name
      }
    }
  }
`;


function Search() {

  const [searchInput, setSearchInput] = useState('');
  const [articleData, setArticleData] = useState();

  const noData = [
    {
    title: 'No results found',
    id: 1,
    }
  ]

  const {data, loading, error, refetch} = useQuery(GET_ALBUMS)

  if (loading) return <View><Text>Loading</Text></View>;
  if (error) return <View><Text>Bad Error</Text></View>;

  const getSearchResults = () => {
    const results = data.articles.filter((article) => article.content.text.includes(searchInput) || article.title.includes(searchInput))
    results.length !== 0 ? setArticleData(results) : setArticleData(noData)
    console.log(results)
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

      <View style={styles.container}>
        <FlatList
        data={articleData}
        keyExtractor={item => item.id}
        renderItem={({item}) => 
            (<Text style={{paddingTop: 10, paddingLeft: 20, paddingRight: 20, paddingBottom: 10 }} key={item.id}>{item.title}</Text>) 
        }
        vertical
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        contentContainerStyle={{columnGap: 10 }}>
        </FlatList>
      </View>

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