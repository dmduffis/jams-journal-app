import { StyleSheet, Text, ScrollView, View } from 'react-native'
import React from 'react'
import FeatureHeader from '../components/FeatureHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthorsRow from '../components/AuthorsRow'
import IssuesRow from '../components/IssuesRow'
import Header from '../components/Header'

const Home = () => {
  return (
    <ScrollView style = {{height: '100%', backgroundColor: '#FFF'}}>
    <Header />
    <FeatureHeader />
        <IssuesRow />
        <AuthorsRow />
      </ScrollView>
  )
}

export default Home

const styles = StyleSheet.create({})