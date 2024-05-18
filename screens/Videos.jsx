import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoSeriesRow from '../components/VideoSeriesRow'

const Videos = () => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Videos</Text>
      </View>
      <VideoSeriesRow />
    </SafeAreaView>
  )
}

export default Videos

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 0.5,
    borderBottomStyle: 'solid',
  },
  pageTitle: {
    fontFamily: 'sans_bold',
    fontSize: 26,
    marginBottom: 10,
    color: '#357db5',
},
})