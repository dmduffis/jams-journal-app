import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const SearchListItem = ({item, noData, dataExists, searchQuery}) => {

    const navigation = useNavigation();

    // Helper function to strip markdown formatting
    const stripMarkdown = (text) => {
        if (!text) return '';
        return text
            // Remove headers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove bold/italic
            .replace(/(\*\*|__)(.*?)\1/g, '$2')
            .replace(/(\*|_)(.*?)\1/g, '$2')
            // Remove links but keep text
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            // Remove inline code
            .replace(/`([^`]+)`/g, '$1')
            // Remove blockquotes
            .replace(/^\>\s+/gm, '')
            // Remove HTML tags
            .replace(/<[^>]*>/g, '')
            // Remove lists markers
            .replace(/^[\*\-\+]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Helper function to highlight matching terms
    const highlightText = (text, query) => {
        // Strip markdown first
        const cleanText = stripMarkdown(text);
        if (!cleanText || !query) return <Text style={styles.matchedText}>{cleanText}</Text>;
        
        // Split query into individual words and filter out common words
        const searchTerms = query
            .toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2); // Only highlight words longer than 2 chars
        
        if (searchTerms.length === 0) {
            return <Text style={styles.matchedText}>{cleanText}</Text>;
        }
        
        // Create a regex pattern to match any of the search terms
        const pattern = new RegExp(`(${searchTerms.join('|')})`, 'gi');
        const parts = cleanText.split(pattern);
        
        return (
            <Text style={styles.matchedText} numberOfLines={2}>
                {parts.map((part, index) => {
                    // Check if this part matches any search term
                    const isMatch = searchTerms.some(term => 
                        part.toLowerCase() === term.toLowerCase()
                    );
                    
                    return isMatch ? (
                        <Text key={index} style={styles.highlightedText}>
                            {part}
                        </Text>
                    ) : (
                        <Text key={index}>{part}</Text>
                    );
                })}
            </Text>
        );
    };

  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Article", {
      item: {
        ...item,
        id: item.originalId || item.id // Use original ID for navigation
      }
    })}>
      <View style={styles.articlesContainer}>
        <View style={styles.articleInfo}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          {item.authors && item.authors.length > 0 && item.authors.map((author, index) => (
            <Text key={`${item.id}-author-${author.id || index}`} style={styles.articleAuthor}>
              {author.name || `${author.firstName} ${author.lastName}`}
            </Text>
          ))}
          {item.matchedChunk && highlightText(item.matchedChunk, searchQuery)}
          {item.similarity && (
            <Text style={styles.similarityText}>
              {Math.round(item.similarity * 100)}% relevant
            </Text>
          )}
        </View>
        <View>
          {dataExists && (
            <Ionicons
              name='chevron-forward-outline'
              size={12}
              color='gray'
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default SearchListItem

const styles = StyleSheet.create({
    articlesContainer: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginBottom: 1,
        borderRadius: 5,
    },
    articleInfo: {
        flex: 1,
        marginRight: 10,
    },
    articleTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 17,
        color: '#303030',
        marginBottom: 5,
    },
    articleAuthor: {
        fontFamily: 'sans_medium',
        color: 'gray',
        fontSize: 13,
        paddingTop: 3,
    },
    matchedText: {
        fontFamily: 'sans_regular',
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        lineHeight: 18,
    },
    highlightedText: {
        fontFamily: 'sans_bold',
        fontSize: 12,
        color: '#357db5',
        backgroundColor: '#e8f4f8',
    },
    similarityText: {
        fontFamily: 'sans_medium',
        fontSize: 11,
        color: '#357db5',
        marginTop: 5,
    },
})