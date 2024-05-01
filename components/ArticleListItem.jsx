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
            {item.authors.map((author) => <Text key={author.id} style={styles.articleAuthor}>{author.name}</Text>)}
            </View>
            <View>
              <Ionicons style={{paddingTop: 15}}
              name='chevron-forward-outline'
              size={20}
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
        },
        articleAuthor: {
          fontFamily: 'sans_medium',
          color: 'gray',
          fontSize: 14,
          paddingTop: 3,
        },
})