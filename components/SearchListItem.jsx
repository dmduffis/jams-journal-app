import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const SearchListItem = ({item, noData, dataExists}) => {

    const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Article", {item})}>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            {item.authors ? (item.authors.map((author) => <Text key={author.id} style={styles.articleAuthor}>{author.name}</Text>)) : ''}
            </View>
            <View>
              {dataExists ? (<Ionicons
              name='chevron-forward-outline'
              size={20}
              color='gray'
              />) : ''}
            </View>
            </View>
          </TouchableOpacity>
  )
}

export default SearchListItem

const styles = StyleSheet.create({
    articlesContainer: {
        padding: 15,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 5,
        },
      articleTitle: {
          fontFamily: 'sans_semibold',
          fontSize: 17,
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