import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const VideoListItem = ({item}) => {

    const navigation = useNavigation();

  return (
    <>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <Text style={styles.articleTitle} numberOfLines={1}>{item.title}</Text>
            {item.authors.map((author) => <Text key={author.id} style={styles.articleAuthor}>{author.name}</Text>)}
            </View>
            <View>
              <Ionicons style={{paddingTop: 15, paddingRight: 5,}}
              name='play-circle-outline'
              size={20}
              color= 'gray'
              />
            </View>
            </View>
    </>
  )
}

export default VideoListItem

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
          paddingRight: 15,
          width: 300,
          color: '#303030'
        },
        articleAuthor: {
          fontFamily: 'sans_medium',
          color: 'gray',
          fontSize: 14,
          paddingTop: 3,
        },
})