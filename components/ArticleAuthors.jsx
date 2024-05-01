import { StyleSheet, Text, View, Image} from 'react-native'
import React from 'react'

const ArticleAuthors = ({author}) => {
  return (
    <View key={author.id.toString()} style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 30}}>
      <Image key={author.url} source={{uri: author.photo.url}} style={{borderRadius: 50, width: 35, height: 35, paddingRight: 10}} />
      <Text key={author.title} style={{fontFamily: 'sans_semibold', fontSize: 16, paddingLeft: 10}}>{author.name}</Text>
    </View>
  )
}

export default ArticleAuthors

const styles = StyleSheet.create({})