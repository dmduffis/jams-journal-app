import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import { AuthorContext } from '../context/AuthorContext'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const Author = ({item}) => {

  const navigation = useNavigation();

  const {followedAuthors, setFollowedAuthors} = useContext(AuthorContext);

  const[followed, setFollowed] = useState(false);

  const deleteAuthor = () => {
    let newAuthorList = followedAuthors.filter((id) => {
        return id !== item.id
      })
    setFollowedAuthors(newAuthorList);
  }

  const addAuthor = () => {
    setFollowedAuthors(prevAuthors => [...prevAuthors, item.id])
  }

  const handleFollow = () => {
    if (followedAuthors.includes(item.id)) {
      deleteAuthor();
    } else {
      addAuthor();
    }
  }




  return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Author Details', {item})}>
          <Image style={styles.photo} source={{uri: item.photo.url}}/>
          <Text style={styles.firstName}>{item.firstName}</Text>
          <Text style={styles.lastName}>{item.lastName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={followedAuthors.includes(item.id) ? styles.followedBtn : styles.followBtn} onPress={() => {handleFollow()}}>
          <Text style={followedAuthors.includes(item.id) ? styles.followedTxt : styles.followTxt}>{followedAuthors.includes(item.id) ? 'Following' : 'Follow'}</Text>
      </TouchableOpacity>
    </View>
  )
}


export default Author

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
        width: 100,
        padding: 15,
  },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 50,
    },
    firstName: {
        fontFamily: 'sans_medium',
        fontSize: 11,
        paddingTop: 3,
        textAlign: 'center'
    },
    lastName: {
        fontFamily: 'sans_medium',
        fontSize: 11,
        paddingTop: 1,
        textAlign: 'center'
    },
    followBtn: {
      marginTop: 7,
      paddingTop: 4,
      paddingBottom: 4,
      width: '100%',
      borderColor: '#5a87b7',
      backgroundColor: '#5a87b7',
      borderWidth: 1,
      borderRadius:12,
  },
  followedBtn: {
    marginTop: 7,
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
    borderColor: '#5a87b7',
    borderWidth: 1,
    borderRadius:12,
},
    followTxt: {
      fontFamily: 'sans_medium',
      fontSize: 10.5,
      textAlign: 'center',
      color: 'white'
  },
  followedTxt: {
    fontFamily: 'sans_medium',
    fontSize: 10.5,
    textAlign: 'center',
    color: '#5a87b7',
}
})