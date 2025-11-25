import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, { Component } from 'react'
import { useRoute } from '@react-navigation/native'
import ArticleListItem from '../components/ArticleListItem';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect} from 'react';
import { AuthorContext } from '../context/AuthorContext';


const AuthorDetails = ({navigation}) => {
  const [authorData, setAuthorData] = useState(null);
  const route = useRoute({navigation});
  const { item } = route.params;
  const {followedAuthors, setFollowedAuthors} = useContext(AuthorContext);

  const getAuthorDetails = async () => {
    try {
      const response = await fetch(
        `https://jams-journal-backend.up.railway.app/authors/${item.id}`
      );
      const data = await response.json();
      
      if (data) {
        setAuthorData(data);
      }
    } catch (error) {
      console.error("Error fetching author details:", error);
    }
  };

  useEffect(() => {
    getAuthorDetails();
  }, [item.id]);

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

  if (!authorData) return null;

  const articles = authorData.articles || []

    return (
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <Image style={styles.coverImg} source={{uri: item.avatar || 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y'}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.firstName} {item.lastName}</Text>
        </View>
        <TouchableOpacity 
      onPress = {() => handleFollow()}
      style={followedAuthors.includes(item.id) ? styles.followedBtn : styles.followBtn}>
      <View style={styles.follow}>
        <Text style={{fontFamily: 'sans_bold',
      fontSize: 15, color: followedAuthors.includes(item.id)? '#007caf' : 'white'}}>{ followedAuthors.includes(item.id)? 'Following' : 'Follow' }
      </Text>
      </View>

      </TouchableOpacity>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {articles.length > 0 ? (
          articles.map((articleItem) => {
            return (
            <ArticleListItem item={articleItem} key={articleItem.id} />
          ) 
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles yet.</Text>
            <Text style={styles.emptySubtext}>This author hasn't published any articles in JAMS.</Text>
            </View>
        )}
    </View>
    </View>
      </ScrollView>
    )
}

export default AuthorDetails

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 50,
  },
  coverImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 75,
},
  detailsContainter: {
    height: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: 40,
    height: '100%',
  },
  issueTitleContainer: {
    borderStyle: 'solid',
    borderBottomColor: 'gray',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
  },
  issueTitle: {
    fontFamily: 'sans_bold',
    fontSize: 25,
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    },
  emptyText: {
      fontFamily: 'sans_semibold',
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    },
  emptySubtext: {
    fontFamily: 'sans_regular',
      fontSize: 14,
    color: '#999',
    textAlign: 'center',
    },
    followedBtn: { 
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'white',
      paddingRight: 10,
      paddingLeft: 10,
      paddingTop: 2,
      paddingBottom: 2,
      margin: 5,
      width: 'auto',
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#007caf' },
    followBtn: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#007caf',
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 3,
        paddingBottom: 3,
        margin: 5,
        width: 'auto',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 15,}
})