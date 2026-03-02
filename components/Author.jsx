import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useContext } from 'react'
import { AuthorContext } from '../context/AuthorContext'

const Author = ({ item }) => {
  const navigation = useNavigation();
  const { isFollowing, addFollow, removeFollow } = useContext(AuthorContext);
  const [imageError, setImageError] = useState(false);

  const handleFollow = () => {
    if (isFollowing(item.id)) removeFollow(item.id);
    else addFollow(item.id);
  };

  // Default placeholder from Supabase storage
  const DEFAULT_AUTHOR_PLACEHOLDER = 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y';
  const displayUrl = (!item.avatar || imageError) ? DEFAULT_AUTHOR_PLACEHOLDER : item.avatar;

  return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Author Details', {item})}>
          <Image 
            style={styles.photo} 
            source={{uri: displayUrl}}
            defaultSource={{uri: DEFAULT_AUTHOR_PLACEHOLDER}}
            onError={() => setImageError(true)}
            onLoadStart={() => {
              if (item.avatar) setImageError(false);
            }}
          />
          <Text style={styles.firstName}>{item.firstName}</Text>
          <Text style={styles.lastName}>{item.lastName}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={isFollowing(item.id) ? styles.followedBtn : styles.followBtn}
        onPress={handleFollow}
      >
        <Text style={isFollowing(item.id) ? styles.followedTxt : styles.followTxt}>
          {isFollowing(item.id) ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}


export default Author

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
        width: 90,
        paddingRight: 15,
        paddingTop:10,
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
      borderRadius: 9999,
  },
  followedBtn: {
    marginTop: 7,
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
    borderColor: '#5a87b7',
    borderWidth: 1,
    borderRadius: 9999,
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