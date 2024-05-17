import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.jams}>Current Issue</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4a8cb0',
        height: 360,
        borderBottomLeftRadius: 25,
    },
    jams: {
        display: 'flex',
        fontFamily: 'sans_regular',
        fontSize: 24,
        color: 'white',
        textAlign: 'left',
        marginTop: 75,
        marginLeft: 20,
    }
})