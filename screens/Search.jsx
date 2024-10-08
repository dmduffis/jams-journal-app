import React, { useEffect } from 'react'
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { Button, StyleSheet, View, Text, TextInput, FlatList, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchListItem from '../components/SearchListItem';
import { Keyboard } from 'react-native'

const GET_ARTICLES = gql`
  query {
    articles {
      content {
        text
        markdown
      }
      title
      id
      authors {
        id
        name
        photo {
            url
        }
      }
    }
  }
`;


function Search() {

  const [searchInput, setSearchInput] = useState('');
  const [articleData, setArticleData] = useState();
  const [dataExists, setDataExists] = useState(false);


  const noData = [
    {
    title: 'No results found',
    id: 1,
    }
  ]

  const {data, loading, error, refetch} = useQuery(GET_ARTICLES)

  if (loading) return <View><Text>Loading</Text></View>;
  if (error) return <View><Text>Bad Error</Text></View>;


  const getSearchResults = () => {
    const results = data.articles.filter((article) => 
      article.content.text.toLowerCase().includes(searchInput.toLowerCase()) 
      || article.title.toLowerCase().includes(searchInput.toLowerCase())
      || article.authors[0].name.toLowerCase().includes(searchInput.toLowerCase())
      )
       
    results.length !== 0 ? setArticleData(results) : setArticleData(noData)
    results.length !== 0 ? setDataExists(true) : setDataExists(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={{marginBottom: 100}}>
      <View>
      <Text style={styles.pageTitle}>Explore</Text>
        <TextInput style={styles.input}
          onChangeText={setSearchInput}
          value={searchInput}
          placeholder="Search articles"
          onChange={getSearchResults}
        />
      </View>

      <View style={styles.container}>
        <FlatList
        data={articleData}
        keyExtractor={item => item.id}
        renderItem={({item}) => 
            <SearchListItem key={item.id} item={item} dataExists={dataExists}/>
        }
        vertical
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        contentContainerStyle={{columnGap: 10 }}>
        </FlatList>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

export default Search;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
  },
  input: {
    height: 45,
    marginLeft: 12,
    marginRight: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 0.2,
    borderRadius: 30,
    padding: 15,
    backgroundColor: '#FFF',
  },
  pageTitle: {
    fontFamily: 'sans_bold',
    fontSize: 26,
    marginBottom: 5,
    color: '#357db5',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
}
});