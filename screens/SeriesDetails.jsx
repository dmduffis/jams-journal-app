import { Text, StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, gql } from '@apollo/client';
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


const SeriesDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  const [playing, setPlaying] = useState(false);
  const [videoID, setVideoID] = useState(null);

  const { loading, error, data } = useQuery(GET_SERIES_DETAILS);

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const seriesData = data.seriesies.filter((series) => series.id === item.id);
  const videos = seriesData[0].videos;
  const currentVideoId = videoID ?? videos[0]?.youtubeId;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
            <YoutubeIframe 
              height={220}
              play={playing}
              videoId={currentVideoId}
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
            currentVideoId === item.youtubeId ? {} : setVideoID(item.youtubeId); setPlaying(true);
          }} key={item.id}>
          <VideoListItem item={item} videoID={currentVideoId}/>
        </TouchableOpacity>
        ) 
        })}
    </View>
    </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SeriesDetails

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontFamily: 'sans_semibold',
    fontSize: 17,
    color: '#357db5',
    marginLeft: 2,
  },
  container: {
    flex: 1,
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