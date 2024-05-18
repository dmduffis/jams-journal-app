import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoSeriesRow from '../components/VideoSeriesRow'

const Videos = () => {
  return (
    <SafeAreaView>
      <Text style={styles.pageTitle}>Videos</Text>
      <VideoSeriesRow />
    </SafeAreaView>
  )
}

export default Videos

const styles = StyleSheet.create({
  pageTitle: {
    fontFamily: 'sans_bold',
    fontSize: 26,
    marginBottom: 5,
    color: '#357db5',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
},
})