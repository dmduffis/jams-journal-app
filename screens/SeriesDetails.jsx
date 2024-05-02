import { Text, StyleSheet, View, Image, ScrollView, TouchableOpacity} from 'react-native'
import React, { Component, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { useQuery, gql } from '@apollo/client';
import ArticleListItem from '../components/ArticleListItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import VideoListItem from '../components/VideoListItem';


const GET_SERIES_DETAILS = gql`{
    seriesies {
      id
      title
      year
      videos {
        youtubeId
        url
        title
        id
        authors {
          name
          id
        }
      }
    }
  }  
`


export default SeriesDetails = ({navigation}) => {

const route = useRoute({navigation});
const { item } = route.params;


const [playing, setPlaying] = useState(false);


const { loading, error, data } = useQuery(GET_SERIES_DETAILS)

if (loading) return null;
if (error) return `Error! ${error}`;

const seriesData = data.seriesies.filter((series) => series.id === item.id)

const videos = seriesData[0].videos

const [videoID, setVideoID] = useState(videos[0].youtubeId);

    return (
<SafeAreaView>
<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
            <YoutubeIframe 
              height={220}
              play={playing}
              videoId={videoID}
            />
        </View>

        <View style={styles.detailsContainer}>
            <View style={styles.issueTitleContainer}>
                <Text style={styles.issueTitle}>{item.title}</Text>
                <Text style={styles.issueDetails}>{item.event} | {item.year}</Text>
            </View>
        <View>
        {videos.map((item) => {
          return (
        <TouchableOpacity onPress={() => {
            videoID === item.id? {}: setVideoID(item.youtubeId); setPlaying(true)}} key={item.id}>
          <VideoListItem item={item} videoID={videoID}/>
        </TouchableOpacity>
        ) 
        })}
    </View>
    </View>
      </ScrollView>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%'
  },
  detailsContainer: {
    height: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  issueTitleContainer: {
    flexDirection: 'column',
    borderColor: 'gray',
    borderBottomWidth: 0.75,
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    paddingBottom: 20,
    marginBottom: 10,
  },
  issueTitle: {
    fontFamily: 'sans_bold',
    fontSize: 24,
    paddingBottom: 3,
  },
  issueDetails: {
    fontFamily: 'sans_medium',
    fontSize: 16,
    paddingBottom: 5,
    color: 'gray'
  },
  articlesContainer: {
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.2,
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    },
  articleInfo: {
    display: 'flex',
    flexBasis: 'auto',
    flexDirection: 'column'
  },
  articleTitle: {
      fontFamily: 'sans_semibold',
      fontSize: 17,
      paddingTop: 15,
      width: 300,
    },
    articleAuthor: {
      fontFamily: 'sans_medium',
      color: 'gray',
      fontSize: 14,
      paddingTop: 3,
    },
})