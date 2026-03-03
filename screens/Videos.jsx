import { StyleSheet, View } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import VideoSeriesRow from '../components/VideoSeriesRow'

const Videos = () => {
  return (
    <View style={styles.wrapper}>
      <Header />
      <VideoSeriesRow />
    </View>
  )
}

export default Videos

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
})