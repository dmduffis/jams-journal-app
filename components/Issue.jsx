import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import React from 'react'

const Issue = ({item}) => {

  const navigation = useNavigation();
  
  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Issue Details", {item})}>
    <View style={styles.container}>
    <Image style={styles.coverImg} source={{uri: item.coverPhoto.url}}/>
      <Text style={styles.titleIssue} numberOfLines={1} ellipsizeMode='tail'>{item.title}</Text>
      <Text style={styles.dateIssue}>Vol. {item.issue} ({item.year})</Text>
    </View>
    </TouchableOpacity>
  )
}

export default Issue

const styles = StyleSheet.create({
    container: {
        width: 130,
    },
    coverImg: {
        width: 110,
        height: 170,
        borderRadius: 5,
    },
    titleIssue: {
        color: 'black',
        fontFamily: 'sans_medium',
        fontSize: 13,
        marginTop: 5,
    },
    dateIssue: {
        color: 'gray',
        fontFamily: 'sans_regular',
        fontSize: 12,
        marginTop: 2,
    }
})