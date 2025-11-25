import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

const TopArticlesItem = ({item, noData, dataExists, idx}) => {

    const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate ("Article", {item})}>
            <View style={styles.articlesContainer}>
            <View style={styles.articleInfo}>
            <View style={styles.articleTextContainer}>
              <Text style={styles.articleTitle}>{item.title}</Text>
              {/* Handle multiple authors */}
              {item.authors && item.authors.length > 0 && (() => {
                const sortedAuthors = item.authors
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(authorItem => authorItem.author || authorItem);
                
                if (sortedAuthors.length >= 2) {
                  // Multiple authors: overlapping photos
                  return (
                    <View style={styles.authorContainer}>
                      <View style={styles.photoStack}>
                        {sortedAuthors.map((author, index) => (
                          <Image 
                            key={author.id || index}
                            source={{uri: author.avatar || 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y'}} 
                            style={[styles.authorPhotoStacked, index > 0 && { marginLeft: -8 }]}
                          />
                        ))}
                      </View>
                      <Text style={styles.articleAuthor}>
                        {sortedAuthors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                      </Text>
                    </View>
                  );
                } else {
                  // Single author: regular layout
                  const author = sortedAuthors[0];
                  return (
                    <View key={author.id} style={styles.authorContainer}>
                      <Image 
                        source={{uri: author.avatar || 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y'}} 
                        style={styles.authorPhoto}
                      />
                      <Text style={styles.articleAuthor}>
                        {author.firstName} {author.lastName}
                      </Text>
                    </View>
                  );
                }
              })()}
              {/* Handle single author (old format) */}
              {!item.authors && item.author && (
                <View style={styles.authorContainer}>
                  <Image 
                    source={{uri: item.author.avatar || 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y'}} 
                    style={styles.authorPhoto}
                  />
                  <Text style={styles.articleAuthor}>
                    {item.author.firstName} {item.author.lastName}
                  </Text>
                </View>
              )}
            </View>
            </View>
            <View>
              {dataExists ? (<Ionicons
              name='chevron-forward-outline'
              size={12}
              color='gray'
              />) : ''}
            </View>
            </View>
          </TouchableOpacity>
  )
}

export default TopArticlesItem

const styles = StyleSheet.create({
    articlesContainer: {
        padding: 6,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 1,
        borderRadius: 5,
        },
      articleTitle: {
          fontFamily: 'sans_semibold',
          fontSize: 16,
          color: '#303030'
        },
    articleAuthor: {
          fontFamily: 'sans_medium',
          color: 'gray',
          fontSize: 12,
        },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    photoStack: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    authorPhoto: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },
    authorPhotoStacked: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
    articleInfo: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        flex: 1,
    },
    articleTextContainer: {
        flex: 1,
    },
    articleIndex: {
        fontFamily: 'sans_bold',
        fontSize: 18,
        width: 'auto',
        color: '#357db5',
      }, 
})