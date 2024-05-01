import { StyleSheet, Text, ScrollView } from 'react-native'
import React from 'react'
import FeatureHeader from '../components/FeatureHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthorsRow from '../components/AuthorsRow'
import BottomTabNavigation from '../navigation/BottomTabNavigation'

const Home = () => {
  return (
    <SafeAreaView>
    <ScrollView>
      <FeatureHeader />
      <AuthorsRow />
    </ScrollView>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})