import { StyleSheet, Text, View, Image} from 'react-native'
import React from 'react'

const ArticleAuthors = ({author}) => {
  return (
    <View key={author.id.toString()} style={styles.container}>
      <Image 
        key={author.url} 
        source={{uri: author.avatar || 'https://via.placeholder.com/35'}} 
        style={styles.authorPhoto} 
      />
      <Text key={author.title} style={styles.authorName}>
        {author.firstName} {author.lastName}
      </Text>
    </View>
  )
}

export default ArticleAuthors

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingBottom: 30
  },
  authorPhoto: {
    width: 35, 
    height: 35, 
    borderRadius: 17.5,
    marginRight: 10,
  },
  authorName: {
    fontFamily: 'sans_semibold', 
    fontSize: 16,
  }
})