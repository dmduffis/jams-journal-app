import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FeatureHeader from '../components/FeatureHeader'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
    <SafeAreaView>
      <FeatureHeader />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})