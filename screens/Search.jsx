import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, Text, TextInput, FlatList, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchListItem from '../components/SearchListItem';
import { Keyboard } from 'react-native'

function Search() {
  const [searchInput, setSearchInput] = useState('');
  const [articleData, setArticleData] = useState([]);
  const [dataExists, setDataExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const noData = [
    {
    title: 'No results found',
    id: 1,
    }
  ]

  // Debounce search to avoid hitting API on every keystroke
  useEffect(() => {
    if (!searchInput || searchInput.trim().length < 2) {
      setArticleData([]);
      setDataExists(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSemanticSearch(searchInput.trim());
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const performSemanticSearch = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://jams-journal-backend.up.railway.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 20,
          threshold: 0.3, // Lower threshold for broader results
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API error:', response.status, errorText);
        throw new Error(`Search failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.results || !Array.isArray(data.results)) {
        console.error('Unexpected response structure:', data);
        setArticleData(noData);
        setDataExists(false);
        setLoading(false);
        return;
      }
      
      // Transform semantic search results to match your existing format
      const transformedResults = data.results.map((result, index) => {
        // Extract article data
        const article = result.article || {};
        
        // Ensure unique IDs by combining article ID with index
        // This prevents any duplicate key errors in React
        const uniqueId = article.id 
          ? `${article.id}-${index}` 
          : `search-result-${index}`;
        
        return {
          id: uniqueId,
          originalId: article.id, // Keep original ID for navigation
          title: article.title || 'Untitled',
          abstract: article.abstract,
          content: article.content,
          matchedChunk: result.matchedChunk, // Snippet of matched content
          similarity: result.similarity,
          author: article.author,
          journal: article.journal,
          journalId: article.journalId,
          // Add authors array for compatibility with SearchListItem
          authors: article.author ? [article.author] : (article.authors || []),
        };
      });

      if (transformedResults.length > 0) {
        setArticleData(transformedResults);
        setDataExists(true);
      } else {
        setArticleData(noData);
        setDataExists(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setArticleData(noData);
      setDataExists(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={{marginBottom: 100}}>
      <View>
      <Text style={styles.pageTitle}>Explore</Text>
          <TextInput 
            style={styles.input}
          onChangeText={setSearchInput}
          value={searchInput}
            placeholder="Try: 'What is contextualization?'"
            placeholderTextColor="#999"
        />
      </View>

      <View style={styles.container}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#357db5" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && searchInput.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Search for articles</Text>
              <Text style={styles.emptySubtext}>
                Try: "cross-cultural ministry", "contextualization", or "worldview"
              </Text>
            </View>
          )}

          {!loading && !error && articleData.length > 0 && (
        <FlatList
        data={articleData}
              keyExtractor={item => item.id.toString()}
        renderItem={({item}) => 
                <SearchListItem 
                  key={item.id} 
                  item={item} 
                  dataExists={dataExists}
                  searchQuery={searchInput}
                />
        }
        vertical
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
              contentContainerStyle={{columnGap: 10}}
            />
          )}
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
    fontFamily: 'sans_regular',
    fontSize: 15,
  },
  pageTitle: {
    fontFamily: 'sans_bold',
    fontSize: 26,
    marginBottom: 5,
    color: '#357db5',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontFamily: 'sans_regular',
    fontSize: 13,
    color: '#666',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontFamily: 'sans_medium',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'sans_medium',
    fontSize: 14,
    color: '#d9534f',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'sans_semibold',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontFamily: 'sans_regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});