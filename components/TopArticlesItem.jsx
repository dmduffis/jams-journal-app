import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const TopArticlesItem = ({item, noData, dataExists, idx}) => {

    const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Article", {item})}>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <Text style={styles.articleIndex}>{idx + 1}</Text>
            <Text style={styles.articleTitle}>{item.title}</Text>
            </View>
            <View>
              {dataExists ? (<Ionicons
              name='chevron-forward-outline'
              size={12}
              color='gray'
              />) : ''}
            </View>
            </View>
          </TouchableOpacity>
  )
}

export default TopArticlesItem

const styles = StyleSheet.create({
    articlesContainer: {
        padding: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginBottom: 1,
        borderRadius: 5,
        },
      articleTitle: {
          fontFamily: 'sans_semibold',
          fontSize: 16,
          width: 290,
          color: '#303030'
        },
    articleAuthor: {
          fontFamily: 'sans_medium',
          color: 'gray',
          fontSize: 13,
          paddingTop: 3,
        },
    articleInfo: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    articleIndex: {
        fontFamily: 'sans_bold',
        fontSize: 25,
        width: 'auto',
        color: '#357db5'
      }, 
})