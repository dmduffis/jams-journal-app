import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import VideoSeriesRow from '../components/VideoSeriesRow'

const Videos = () => {
  return (
    <SafeAreaView>
      <VideoSeriesRow />
    </SafeAreaView>
  )
}

export default Videos

const styles = StyleSheet.create({})