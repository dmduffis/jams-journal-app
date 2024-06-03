import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import { AuthorContext } from '../context/AuthorContext'

const Author = ({item}) => {

  const navigation = useNavigation();

  const {followedAuthors, setFollowedAuthors} = useContext(AuthorContext);

  const[followed, setFollowed] = useState(false);

  const checkFollowedAuthors = () => {
    followedAuthors.map((author) => {
      if (author.id === item.id) {
        setFollowed(true);
      } else {
        setFollowed(false);
      }
    })
  }

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
    if (followed === true) {
      deleteAuthor();
      setFollowed(false)
    } else {
      addAuthor();
      setFollowed(true)
    }
  }

  useEffect(() => {
    checkFollowedAuthors();
  }, [])



  return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Author Details', {item})}>
          <Image style={styles.photo} source={{uri: item.photo.url}}/>
          <Text style={styles.firstName}>{item.firstName}</Text>
          <Text style={styles.lastName}>{item.lastName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.followBtn} onPress={() => {handleFollow()}}>
          <Text style={styles.followTxt}>{followed ? 'Following' : 'Follow'}</Text>
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
      borderColor: 'blue',
      borderWidth: 1,
      borderRadius:12,
  },
    followTxt: {
      fontFamily: 'sans_medium',
      fontSize: 10.5,
      textAlign: 'center'
  }
})