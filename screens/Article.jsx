import { View, Text, SafeAreaView, FlatList, StyleSheet, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client';
import Markdown from 'react-native-markdown-display';
import { useRoute } from '@react-navigation/native';


const Article = () => {
const routes = useRoute();
const { item } = routes.params

return (
  <ScrollView showsVerticalScrollIndicator={false} style={styles.container} >
    <Text style={styles.title}>{item.title}</Text>
    
    <View>
      {item.authors.map((author) => {
        return (
      <View key={item.id.toString()} style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 30}}>
      <Image key={item.url} source={{uri: author.photo.url}} style={{borderRadius: 50, width: 35, height: 35, paddingRight: 10}} />
      <Text key={item.title} style={{fontFamily: 'sans_semibold', fontSize: 16, paddingLeft: 10}}>{author.name}</Text>
    </View>
    )})}
    </View>

    <View>
    <Markdown selectable style={styles}>{item.content.markdown}</Markdown>
    </View>
    </ScrollView>
  )
}

export default Article

const styles = StyleSheet.create({
  container: {
  paddingTop: 100,
  paddingLeft: 20,
  paddingRight: 20,
  marginBottom: 50,
  backgroundColor: '#fff',
  },
  body: {
    fontSize: 16, 
    fontFamily: 'serif_regular',
    lineHeight: 32,
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading1: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading2: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading3: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading4: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
  },
  em: {
    fontFamily: 'serif_italic'
  },
  i: {
    fontFamily: 'serif_italic'
  },
  strong: {
    fontFamily: 'serif_bold'
  },
  blockquote: {
    fontSize: 15,
    backgroundColor: 'none',
    borderLeftWidth: 'none',
    paddingRight: 20,
  },
  ordered_list: {
    marginTop: 10,
  },
  order_list_icon: {
    marginTop: 10,
  }
})
