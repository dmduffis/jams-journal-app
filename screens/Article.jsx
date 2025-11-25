import { View, Text, SafeAreaView, FlatList, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import RenderHtml from 'react-native-render-html';
import Markdown from 'react-native-markdown-display';
import { useRoute } from '@react-navigation/native';
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
        setArticleData(data);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  useEffect(() => {
    getArticleDetails();
  }, [item.id]);

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
  <ScrollView showsVerticalScrollIndicator={false} style={styles.container} >
      <Text style={styles.title}>{articleData.title}</Text>
    
    <View>
        {/* Handle multiple authors */}
        {articleData.authors && articleData.authors.length > 0 && 
          articleData.authors
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((authorItem, index) => {
              const author = authorItem.author || authorItem;
              return <ArticleAuthors author={author} key={author.id || index} />;
            })
        }
        {/* Handle single author */}
        {!articleData.authors && articleData.author && (
          <ArticleAuthors author={articleData.author} />
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
  )
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
  container: {
    paddingTop: 100,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
})
