import { StyleSheet, Text, ScrollView, View } from 'react-native'
import React from 'react'
import FeatureHeader from '../components/FeatureHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthorsRow from '../components/AuthorsRow'
import IssuesRow from '../components/IssuesRow'
import Header from '../components/Header'
import TopArticles from '../components/TopArticles'

const Home = () => {
  return (
    <View>
    <Header />
    <ScrollView showsVerticalScrollIndicator={false} style = {{marginBottom: 170}}>
    <FeatureHeader />
    <TopArticles />
        <IssuesRow />
        <AuthorsRow />
      </ScrollView>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})