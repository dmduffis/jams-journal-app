import { StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const ArticleAuthors = ({author}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      key={author.id.toString()} 
      style={styles.container}
      onPress={() => navigation.navigate('Author Details', { item: author })}
    >
      <Image 
        key={author.url} 
        source={{uri: author.avatar || 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y'}} 
        style={styles.authorPhoto} 
      />
      <Text key={author.title} style={styles.authorName}>
        {author.firstName} {author.lastName}
      </Text>
    </TouchableOpacity>
  )
}

export default ArticleAuthors

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingBottom: 30
  },
  authorPhoto: {
    width: 35, 
    height: 35, 
    borderRadius: 17.5,
    marginRight: 10,
  },
  authorName: {
    fontFamily: 'sans_semibold', 
    fontSize: 16,
  }
})