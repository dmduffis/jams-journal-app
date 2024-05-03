import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native'
import React from 'react'
import { useQuery, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

const GET_CURRENT_ISSUE = gql`query {
  journals {
    coverPhoto {
      url
    }
    id
    issue
    title
    year
  }
}
`


  const FeatureHeader = () => {

  const navigation = useNavigation();

  const { loading, error, data } = useQuery(GET_CURRENT_ISSUE) 

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const item = data.journals[1]

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate ("Issue Details", {item})}>
        <Image style={styles.featuredImg} source={{uri: item.coverPhoto.url}}/>
        </TouchableOpacity>
      <View style={styles.txtContainer}>
        <Text style={styles.txtCurrent}>Current Issue</Text>
        <Text style={styles.txtIssueTitle}>{item.title}</Text>
        <Text style={styles.txtIssueNumber}>Vol {item.issue} | {item.year}</Text>
        <TouchableOpacity onPress={() => navigation.navigate ("Issue Details", {item})}><Text style={styles.txtReadNow}>Read Now</Text></TouchableOpacity>
      </View>
    </View>
  )
}

export default FeatureHeader

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: 160,
        width: '100vw',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        marginTop: 10,
        borderRadius: 10,
        paddingBottom: 10,
        borderWidth: 0.5,
        borderColor: '#D4D4D4',
        borderStyle: 'solid',
        backgroundColor: '#f0f0e4'
    },
    featuredImg: {
        width: 105,
        height: 158,
        borderTopLeftRadius: 9.5,
        borderBottomLeftRadius: 9.5,
    },
    txtContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 20,
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
        fontSize: 15,
        color: '#868689',
    },
    txtIssueTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 20,
        color: 'black'
    },
    txtReadNow: {
        marginTop: 15,
        fontFamily: 'sans_semibold',
        fontSize: 15,
        color: 'black'
    },
})