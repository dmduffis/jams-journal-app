import { Text, StyleSheet, View, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native'
import React, { Component } from 'react'
import { useRoute } from '@react-navigation/native'
import ArticleComponent from '../components/ArticleComponent';
import { useQuery, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState, useEffect} from 'react';
import { AuthorContext } from '../context/AuthorContext';


const GET_AUTHOR_RESOURCES = gql`{
  authors {
    id
    lastName
    firstName
    photo {
      url
    }
    articles {
      title
      id
      content {
        markdown
      }
      authors {
        name
        id
        photo {
          url
        }
      }
      journal {
        issue
        year
      }
    }
  }
}
`


export default AuthorDetails = ({navigation}) => {


  const route = useRoute({navigation});
  
  const { item } = route.params;

  const {followedAuthors, setFollowedAuthors} = useContext(AuthorContext);

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


  const { loading, error, data } = useQuery(GET_AUTHOR_RESOURCES)

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const issueData = data.authors.filter((author) => author.id === item.id)

  const articles = issueData[0].articles

    return (
<ScrollView styl={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <Image style={styles.coverImg} source={{uri: item.photo.url}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.name}</Text>
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
        {articles.map((item, i) => {
          return (<TouchableOpacity key={i} onPress={() => navigation.navigate ("Article", {item})}>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleAuthor}>in Issue {item.journal.issue} ({item.journal.year})</Text>
            </View>
            <View>
              <Ionicons style={{paddingTop: 15}}
              name='chevron-forward-outline'
              size={12}
              color='gray'
              />
            </View>
            </View>
          </TouchableOpacity>) 
        })}
            
          
    </View>
    </View>
      </ScrollView>
    )
}

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
  // articleInfo: {
  //   display: 'flex',
  //   flexBasis: 'auto',
  //   flexDirection: 'column'
  // },
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