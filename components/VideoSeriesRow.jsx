import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import VideoSeriesComponent from './VideoSeriesComponent';
import { useQuery, gql } from '@apollo/client';

const GET_SERIES = gql`query {
    seriesies {
      title
      id
      year
      event
      coverPhoto {
        url
      }
      videos {
        authors {
          name
          id
        }
        id
        title
        youtubeId
        url
      }
    }
  }  
  `

const VideoSeriesRow = () => {

const { loading, error, data } = useQuery(GET_SERIES) 

if (loading) return null;
if (error) return `Error! ${error}`;

  return (
    <View style={styles.container}>
    <FlatList
    data={data.seriesies}
    keyExtractor={item => item.id}
    renderItem={({item}) => 
        (<VideoSeriesComponent item = {item} key={item.id}/>) 
    }
    vertical
    showsVerticalScrollIndicator={false}
    removeClippedSubviews={true}
    contentContainerStyle={{columnGap: 10 }}>
    </FlatList>
    </View>
  )
}

export default VideoSeriesRow

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
    },
    sectionTitle: {
        color: 'black',
        fontFamily: 'sans_semibold',
        fontSize: 18,
        marginBottom: 10,
    }
})