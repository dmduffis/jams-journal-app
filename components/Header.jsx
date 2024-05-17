import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.jams}>jams</Text>
      <Ionicons 
      name = 'search-outline'
      color= 'white'
      size = {24}
      style = {{marginTop: 59}}
      />
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 120,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 0,
        backgroundColor: '#357db5'
    },
    jams: {
        fontFamily: 'Times',
        fontSize: 30,
        color: 'white',
        marginTop: 48,
    }
})