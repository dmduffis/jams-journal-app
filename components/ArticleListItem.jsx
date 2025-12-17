import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const ArticleListItem = ({item}) => {

    const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Article", {item})}>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            {/* Handle multiple authors */}
            {item.authors && item.authors.length > 0 && 
              item.authors.map((author, index) => {
                // Handle different author field structures
                const authorName = author.name 
                  || (author.firstName && author.lastName ? `${author.firstName} ${author.lastName}` : null)
                  || author.firstName 
                  || author.lastName
                  || 'Unknown Author';
                
                return (
                  <Text key={author.id || `author-${item.id}-${index}`} style={styles.articleAuthor}>
                    {authorName}
                  </Text>
                );
              })
            }
            {/* Handle single author */}
            {!item.authors && item.author && (
              <Text style={styles.articleAuthor}>
                {item.author.name 
                  || (item.author.firstName && item.author.lastName ? `${item.author.firstName} ${item.author.lastName}` : null)
                  || item.author.firstName 
                  || item.author.lastName
                  || 'Unknown Author'}
              </Text>
            )}
            </View>
            <View>
              <Ionicons style={{paddingTop: 15}}
              name='chevron-forward-outline'
              size={12}
              color='gray'
              />
            </View>
            </View>
          </TouchableOpacity>
  )
}

export default ArticleListItem

const styles = StyleSheet.create({
    articlesContainer: {
        paddingBottom: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.2,
        borderStyle: 'solid',
        borderBottomColor: 'gray',
        },
      articleTitle: {
          fontFamily: 'sans_semibold',
          fontSize: 17,
          paddingTop: 15,
          width: 300,
          color: '#303030'
        },
        articleAuthor: {
          fontFamily: 'sans_medium',
          color: 'gray',
          fontSize: 14,
          marginTop: 3,
          paddingBottom: 3,
        },
})