import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const Author = ({item}) => {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Author Details', {item})}>
        <Image style={styles.photo} source={{uri: item.photo.url}}/>
      <Text style={styles.firstName}>{item.firstName}</Text>
      <Text style={styles.lastName}>{item.lastName}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Author

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        height: 110,
        padding: 10,
        marginRight: 10,
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    firstName: {
        fontFamily: 'sans_medium',
        fontSize: 11,
        paddingTop: 3,
        textAlign: 'center'
    },
    lastName: {
        fontFamily: 'sans_medium',
        fontSize: 11,
        paddingTop: 1,
        textAlign: 'center'
    }
})