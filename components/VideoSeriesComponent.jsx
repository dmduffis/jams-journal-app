import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';


  const VideoSeriesComponent = ({item}) => {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate ("Issue Details", {item})}>
        <Image style={styles.featuredImg} source={{uri: item.coverPhoto.url}}/>
      <View style={styles.txtContainer}>
        <Text style={styles.txtIssueTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.txtIssueNumber}>{item.event} | {item.year}</Text>
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
        marginBottom: 10,
        marginTop: 10,
        borderRadius: 10,
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: '#D4D4D4',
        borderStyle: 'solid',
        backgroundColor: '#fff'
    },
    featuredImg: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9,
    },
    txtContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 10,
    },
    txtCurrent: {
        fontFamily: 'sans_medium',
        marginBottom: 5,
        fontSize: 15,
        color: '#868689',
    },
    txtIssueNumber: {
        fontFamily: 'sans_medium',
        marginTop: 5,
        fontSize: 14,
        color: '#868689',
    },
    txtIssueTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 18,
        color: 'black'
    },
    txtReadNow: {
        marginTop: 15,
        fontFamily: 'sans_semibold',
        fontSize: 15,
        color: 'black'
    },
})