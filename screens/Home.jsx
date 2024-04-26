import { StyleSheet, Text, ScrollView } from 'react-native'
import React from 'react'
import FeatureHeader from '../components/FeatureHeader'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
    <ScrollView>
      <FeatureHeader />
    </ScrollView>
  )
}

export default Home

const styles = StyleSheet.create({})