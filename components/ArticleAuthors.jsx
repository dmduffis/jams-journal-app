import { StyleSheet, Text, View, Image} from 'react-native'
import React, { useState } from 'react'

// Default placeholder from Supabase storage
const DEFAULT_AUTHOR_PLACEHOLDER = 'https://flvqnuanthbcwndlibds.supabase.co/storage/v1/object/sign/Images/default_fallback_profile.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kZjI4MDE3NS1iNGExLTQ0ODctYjg1Yi02NmU4M2JiYWVmMzkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvZGVmYXVsdF9mYWxsYmFja19wcm9maWxlLnBuZyIsImlhdCI6MTc2NDAwMzU3MywiZXhwIjozMzQwODAzNTczfQ.c4K0LPTW2mHNf8zt_zklvsNJwnLS-WA_3avEBDW_q9Y';

const ArticleAuthors = ({author}) => {
  // Normalize avatar/photo field - handle different possible structures
  const avatarUrl = author.avatar 
    || author.photo?.url 
    || (typeof author.photo === 'string' ? author.photo : null);
  
  const [imageError, setImageError] = useState(!avatarUrl);
  
  // Use placeholder if no URL or if image failed to load
  const displayUrl = (!avatarUrl || imageError) ? DEFAULT_AUTHOR_PLACEHOLDER : avatarUrl;
  
  return (
    <View key={author.id?.toString() || 'author'} style={styles.container}>
      <Image 
        source={{uri: displayUrl}} 
        style={styles.authorPhoto}
        defaultSource={{uri: DEFAULT_AUTHOR_PLACEHOLDER}}
        onError={() => setImageError(true)}
        onLoadStart={() => {
          if (avatarUrl) setImageError(false);
        }}
      />
      <Text style={styles.authorName}>
        {author.firstName} {author.lastName}
      </Text>
    </View>
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