import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native'
import React from 'react'
import { useQuery, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.current}><Text style={styles.txtCurrent}>Vol {item.issue}</Text></View>
        <Text style={styles.txtIssueTitle}>{item.title}</Text>
        <Text style={styles.txtIssueNumber}>Methods, case studies, and practical tips on the use of house churches in Adventist missions.</Text>
      
      <View style={styles.actionOptions}>
        <TouchableOpacity style={styles.readBtn} onPress={() => navigation.navigate ("Issue Details", {item})}>
          <Text style={styles.txtReadNow}>View Issue</Text>
          <Text style={{marginLeft: 5}}><Ionicons name='arrow-forward-sharp' size={20} color='#4a8cb0'/></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text style={{marginLeft: 20, marginTop: 15}}><Ionicons name='bookmark-outline' size={20} color='#4a8cb0'/></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text style={{marginLeft: 8, marginTop: 15}}><Ionicons name='share-outline' size={20} color='#4a8cb0'/></Text>
        </TouchableOpacity>
        
        </View>
      </View>
    </View>
  )
}

export default FeatureHeader

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 110,
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'center',
        height: 'auto',
        width: '93%',
        marginBottom: 5,
        marginTop: 10,
        marginLeft: 5,
        marginRight: 5,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        zIndex: 999,
    },
    featuredImg: {
        width: 115,
        height: 179,
        borderRadius: 3,
    },
    txtContainer: {
        display: 'flex',
        width: 230,
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 20,
        marginRight: 20,
        paddingRight: 20,
    },
    txtCurrent: {
        fontFamily: 'sans_bold',
        textTransform: 'uppercase',
        fontSize: 13,
        color: '#4a8cb0',

    },
    txtIssueNumber: {
        fontFamily: 'sans_medium',
        marginTop: 10,
        fontSize: 13,
        color: '#868689',
    },
    txtIssueTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 20,
        color: 'black',
    },
    actionOptions: { 
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',

    },
    txtReadNow: {
        fontFamily: 'sans_semibold',
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        color: '#4a8cb0',
    },
    readBtn: {
      padding: 8,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      marginTop: 15,
      width: 125,
      borderRadius: 20,
      borderColor: '#4a8cb0',
      borderWidth: 1,
      borderStyle: 'solid',
    }
})