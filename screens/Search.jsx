import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, Text, TextInput, FlatList, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import SearchListItem from '../components/SearchListItem';
import { Keyboard } from 'react-native';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 76;

function Search() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = TAB_BAR_HEIGHT + insets.bottom + 24;
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
          threshold: 0.3,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Search failed: ${response.status}`;
        
        // Try to parse error message from response
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText.substring(0, 100) || errorMessage;
        }
        
        console.error('Search API error:', response.status, errorMessage);
        
        // Check if it's an API key error
        if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('api_key')) {
          throw new Error('Backend API key configuration error. Please contact support.');
        }
        
        throw new Error(errorMessage);
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
      <View style={styles.wrapper}>
        <Header />
        <View style={styles.headerSection}>
          <TextInput 
            style={styles.input}
            onChangeText={setSearchInput}
            value={searchInput}
            placeholder="e.g. contextual theology, migration"
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
              <Ionicons name="search" size={48} color="#ccc" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Search for articles</Text>
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
              contentContainerStyle={[styles.listContent, { columnGap: 10, paddingBottom: listBottomPadding }]}
              style={styles.list}
            />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default Search;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    backgroundColor: '#fff',
  },
  listContent: {},
  input: {
    minHeight: 50,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 0.2,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    fontFamily: 'sans_regular',
    fontSize: 15,
    lineHeight: 20,
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
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'sans_semibold',
    fontSize: 16,
    color: '#333',
  },
});