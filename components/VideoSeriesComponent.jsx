import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


  const VideoSeriesComponent = ({item}) => {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate ("Series Details", {item})}>
        <Image style={styles.featuredImg} source={{uri: item.coverPhoto.url}}/>
      <View style={styles.txtContainer}>
        <Text style={styles.txtSeriesTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.txtConferenceTitle}>{item.event} | {item.year}</Text>
        <View style={styles.videoQuantity}>
        <Ionicons style={{marginTop: 1}}name='videocam' size={16} color='#357db5' />
        <Text style={styles.txtVideoCount}>{item.videos.length} videos</Text>
        </View>
      </View>
      </TouchableOpacity>
    </View>
  )
}

export default VideoSeriesComponent

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        marginBottom: 5,
        marginTop: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D4D4D4',
        borderStyle: 'solid',
        backgroundColor: '#fff'
    },
    featuredImg: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 19,
        borderTopRightRadius: 19,
    },
    txtContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10,
        padding: 5,
    },
    txtCurrent: {
        fontFamily: 'sans_medium',
        fontSize: 15,
        color: '#868689',
    },
    txtConferenceTitle: {
        fontFamily: 'sans_medium',
        marginTop: 2,
        fontSize: 14,
        color: '#868689',
    },
    videoQuantity: {
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    txtVideoCount: {
      fontFamily: 'sans_bold',
      fontSize: 14,
      color: '#357db5',
    },
    txtSeriesTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 18,
        color: 'black',
    },
    txtReadNow: {
        marginTop: 15,
        fontFamily: 'sans_semibold',
        fontSize: 15,
        color: 'black'
    },
})