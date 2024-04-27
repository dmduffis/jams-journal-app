import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const Author = ({item}) => {
  return (
    <View style={styles.container}>
        <Image style={styles.photo} source={{uri: item.photo.url}}/>
      <Text style={styles.firstName}>{item.firstName}</Text>
      <Text style={styles.lastName}>{item.lastName}</Text>
    </View>
  )
}

export default Author

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        width: 95,
        height: 110,
        padding: 10,
        borderRadius: 20,
        borderStyle: 'solid',
        borderColor: '#D4D4D4',
        borderWidth: 1,
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    firstName: {
        fontFamily: 'semibold',
        fontSize: 11,
        paddingTop: 3,
        textAlign: 'center'
    },
    lastName: {
        fontFamily: 'semibold',
        fontSize: 11,
        paddingTop: 1,
        textAlign: 'center'
    }
})