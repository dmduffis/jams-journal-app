import { View, Text, StyleSheet, Image, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import RenderHtml from 'react-native-render-html';
import Markdown from 'react-native-markdown-display';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ArticleAuthors from '../components/ArticleAuthors';

// Define system fonts for HTML rendering
const systemFonts = [
  'serif_regular',
  'serif_bold',
  'serif_italic',
  'sans_regular',
  'sans_bold',
  'sans_semibold',
];

// Styles for HTML tags
const tagsStyles = {
  body: {
    fontSize: 16,
    fontFamily: 'serif_regular',
    lineHeight: 32,
    color: '#333',
  },
  p: {
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'serif_regular',
    lineHeight: 32,
  },
  h1: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
    marginTop: 20,
    marginBottom: 15,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 30,
    marginBottom: 10,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 30,
    marginBottom: 10,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 20,
    marginBottom: 10,
  },
  em: {
    fontFamily: 'serif_italic',
  },
  i: {
    fontFamily: 'serif_italic',
  },
  strong: {
    fontFamily: 'serif_bold',
    fontWeight: 'bold',
  },
  b: {
    fontFamily: 'serif_bold',
    fontWeight: 'bold',
  },
  table: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  thead: {
    backgroundColor: '#357db5',
  },
  th: {
    padding: 12,
    fontFamily: 'sans_bold',
    fontSize: 14,
    color: '#fff',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
  },
  td: {
    padding: 12,
    fontFamily: 'serif_regular',
    fontSize: 14,
    lineHeight: 22,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  blockquote: {
    fontSize: 15,
    fontFamily: 'serif_italic',
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#357db5',
    marginVertical: 10,
  },
  ul: {
    marginTop: 10,
  },
  ol: {
    marginTop: 10,
  },
  li: {
    marginBottom: 5,
  },
};

const Article = () => {
  const [articleData, setArticleData] = useState(null);
  const navigation = useNavigation();
  const routes = useRoute();
  const { item } = routes.params;
  const { width } = useWindowDimensions();

  const getArticleDetails = async () => {
    try {
      const response = await fetch(
        `https://jams-journal-backend.up.railway.app/articles/${item.id}`
      );
      const data = await response.json();
      
      if (data) {
        // Normalize authors - extract actual author objects from nested structure
        if (data.authors && Array.isArray(data.authors)) {
          // Authors array contains objects with nested 'author' property
          // Extract the actual author objects and normalize avatar/photo
          data.authors = data.authors
            .map(authorItem => {
              const author = authorItem.author || authorItem;
              if (author) {
                // Normalize avatar/photo field
                author.avatar = author.avatar 
                  || author.photo?.url 
                  || (typeof author.photo === 'string' ? author.photo : null);
              }
              return author;
            })
            .filter(author => author); // Remove any null/undefined
        } else if (data.author) {
          // Single author case - normalize avatar/photo
          const author = data.author;
          author.avatar = author.avatar 
            || author.photo?.url 
            || (typeof author.photo === 'string' ? author.photo : null);
          data.authors = [author];
        } else {
          // No authors at all
          data.authors = [];
        }
        
        setArticleData(data);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  useEffect(() => {
    getArticleDetails();
  }, [item.id]);

  const insets = useSafeAreaInsets();
  if (!articleData) return null;

  // Convert superscript notation to unicode superscript characters
  const formatContent = (content) => {
    if (!content) return '';
    const superscriptMap = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    // Convert ^1^ or [^1] to unicode superscript
    return content
      .replace(/\^\^?(\d+)\^\^?/g, (match, num) => 
        num.split('').map(d => superscriptMap[d] || d).join('')
      )
      .replace(/\[\^(\d+)\]/g, (match, num) => 
        num.split('').map(d => superscriptMap[d] || d).join('')
      );
  };

  // Split content into markdown and HTML table segments
  const parseContent = (content) => {
    if (!content) return [];
    
    const formattedContent = formatContent(content);
    const segments = [];
    
    // Regex to match HTML tables
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    let lastIndex = 0;
    let match;
    
    while ((match = tableRegex.exec(formattedContent)) !== null) {
      // Add markdown content before the table
      if (match.index > lastIndex) {
        const markdownContent = formattedContent.substring(lastIndex, match.index).trim();
        if (markdownContent) {
          segments.push({ type: 'markdown', content: markdownContent });
        }
      }
      
      // Add the HTML table
      segments.push({ type: 'html', content: match[0] });
      lastIndex = tableRegex.lastIndex;
    }
    
    // Add any remaining markdown content after the last table
    if (lastIndex < formattedContent.length) {
      const markdownContent = formattedContent.substring(lastIndex).trim();
      if (markdownContent) {
        segments.push({ type: 'markdown', content: markdownContent });
      }
    }
    
    // If no tables found, return all content as markdown
    if (segments.length === 0) {
      segments.push({ type: 'markdown', content: formattedContent });
    }
    
    return segments;
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <Text style={styles.title}>{articleData.title}</Text>
      {(articleData.authors?.length > 0 || articleData.author) && (
        <Text style={styles.articleByline}>
          {articleData.authors?.length > 0
            ? articleData.authors
                .map((a) => [a.firstName, a.lastName].filter(Boolean).join(" ") || a.name || "Author")
                .join(", ")
            : [articleData.author?.firstName, articleData.author?.lastName].filter(Boolean).join(" ") || articleData.author?.name || "Author"}
        </Text>
      )}
    <View>
        {/* Handle multiple authors */}
        {articleData.authors && articleData.authors.length > 0 && 
          articleData.authors.map((author, index) => {
            // Normalize author object to ensure it has the expected structure
            const normalizedAuthor = {
              ...author,
              firstName: author.firstName || (author.name ? author.name.split(' ')[0] : ''),
              lastName: author.lastName || (author.name ? author.name.split(' ').slice(1).join(' ') : ''),
              avatar: author.avatar || author.photo?.url || author.photo
            };
            return (
              <ArticleAuthors author={normalizedAuthor} key={author.id || `article-author-${index}`} />
            );
          })
        }
        {/* Handle single author */}
        {!articleData.authors && articleData.author && (
          <ArticleAuthors 
            author={{
              ...articleData.author,
              firstName: articleData.author.firstName || (articleData.author.name ? articleData.author.name.split(' ')[0] : ''),
              lastName: articleData.author.lastName || (articleData.author.name ? articleData.author.name.split(' ').slice(1).join(' ') : ''),
              avatar: articleData.author.avatar || articleData.author.photo?.url || articleData.author.photo
            }} 
            key={articleData.author.id || 'single-author'} 
          />
        )}
    </View>

    <View>
        {parseContent(articleData.content).map((segment, index) => {
          if (segment.type === 'markdown') {
            return (
              <Markdown key={index} style={markdownStyles}>
                {segment.content}
              </Markdown>
            );
          } else if (segment.type === 'html') {
            return (
              <RenderHtml
                key={index}
                contentWidth={width - 40}
                source={{ html: segment.content }}
                tagsStyles={tagsStyles}
                systemFonts={systemFonts}
              />
            );
          }
          return null;
        })}
    </View>
      </ScrollView>
    </View>
  );
}

export default Article

// Markdown-specific styles
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16, 
    fontFamily: 'serif_regular',
    lineHeight: 32,
    paddingBottom: 20,
  },
  heading1: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading2: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading3: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading4: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
  },
  em: {
    fontFamily: 'serif_italic'
  },
  i: {
    fontFamily: 'serif_italic'
  },
  strong: {
    fontFamily: 'serif_bold'
  },
  blockquote: {
    fontSize: 15,
    backgroundColor: 'none',
    borderLeftWidth: 'none',
    paddingRight: 20,
  },
  ordered_list: {
    marginTop: 10,
  },
  order_list_icon: {
    marginTop: 10,
  }
});

// Regular styles for the component
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarFill: {
    backgroundColor: '#fff',
    width: '100%',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontFamily: 'sans_semibold',
    fontSize: 17,
    color: '#357db5',
    marginLeft: 2,
  },
  container: {
    flex: 1,
    paddingTop: 24,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    paddingBottom: 8,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  articleByline: {
    fontFamily: 'sans_medium',
    fontSize: 16,
    color: '#555',
    paddingBottom: 20,
  },
})
