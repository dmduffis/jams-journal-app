import { Text, StyleSheet, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { AuthorContext } from "../context/AuthorContext";
import { JAMS_BACKEND_BASE_URL } from "../lib/jamsBackend";

const AuthorDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  const { isFollowing, addFollow, removeFollow } = useContext(AuthorContext);
  const [followLoading, setFollowLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const authorId = item?.id != null ? String(item.id) : null;
    const fn = (item?.firstName || "").trim().toLowerCase();
    const ln = (item?.lastName || "").trim().toLowerCase();

    /** Article authors are { author: { id, firstName, lastName }, order } – use nested author for comparison. */
    function matchesAuthor(authorEntry) {
      const a = authorEntry?.author ?? authorEntry;
      const id = a?.id != null ? String(a.id) : null;
      const first = (a?.firstName || "").trim().toLowerCase();
      const last = (a?.lastName || "").trim().toLowerCase();
      if (authorId && id) return id === authorId;
      return fn && ln && first === fn && last === ln;
    }

    /** Same normalization as IssueDetails – authors from journal payload. */
    function normalizeArticle(article, journal) {
      const a = { ...article };
      if (a.journal == null && journal) {
        a.journal = {
          issue: journal.issue ?? journal.issueNumber,
          year: journal.year,
          title: journal.title,
        };
      }
      if (a.authors && Array.isArray(a.authors)) {
        a.authors = a.authors
          .map((authorItem) => {
            const author = authorItem?.author || authorItem;
            if (!author) return null;
            return {
              ...author,
              avatar: author.avatar || author.photo?.url || (typeof author.photo === "string" ? author.photo : null) || author.photo,
            };
          })
          .filter(Boolean);
      } else if (a.author) {
        const author = a.author;
        a.authors = [{ ...author, avatar: author.avatar || author.photo?.url || (typeof author.photo === "string" ? author.photo : null) || author.photo }];
      } else {
        a.authors = [];
      }
      return a;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let list = [];
        // Same data source as Issue Details: GET /journals returns journals with articles embedded
        const journalsRes = await fetch(`${JAMS_BACKEND_BASE_URL}/journals`);
        if (journalsRes.ok) {
          const journalsData = await journalsRes.json();
          const journals = Array.isArray(journalsData) ? journalsData : journalsData?.data ?? [];
          for (const journal of journals) {
            if (cancelled) break;
            const arts = Array.isArray(journal?.articles) ? journal.articles : [];
            for (const art of arts) {
              const authors = art?.authors || (art?.author ? [art.author] : []);
              if (authors.some(matchesAuthor)) {
                list.push(normalizeArticle(art, journal));
              }
            }
          }
        }
        // Dedupe by article id
        const seen = new Set();
        list = list.filter((art) => {
          const id = art?.id != null ? String(art.id) : null;
          if (id && seen.has(id)) return false;
          if (id) seen.add(id);
          return true;
        });
        if (!cancelled) setArticles(list);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load articles");
          setArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [item?.id, item?.firstName, item?.lastName]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing(item.id)) await removeFollow(item.id);
      else await addFollow(item.id);
    } catch (_e) {
      // Error already logged in context
    } finally {
      setFollowLoading(false);
    }
  };

  return (
<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View>
        <Image style={styles.coverImg} source={{uri: item.avatar || 'https://via.placeholder.com/400x400'}} />
        <View style={styles.issueTitleContainer}>
        <Text style={styles.issueTitle}>{item.firstName} {item.lastName}</Text>
        </View>
        <TouchableOpacity
          onPress={handleFollow}
          style={isFollowing(item.id) ? styles.followedBtn : styles.followBtn}
          disabled={followLoading}
        >
          <View style={styles.follow}>
            <Text style={{ fontFamily: 'sans_bold', fontSize: 15, color: isFollowing(item.id) ? '#007caf' : 'white' }}>
              {followLoading ? "…" : isFollowing(item.id) ? "Following" : "Follow"}
            </Text>
          </View>
        </TouchableOpacity>
        </View>

        <View style={styles.detailsContainter}>
        <View>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#357db5" />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : articles.length > 0 ? (
          articles.map((article, index) => {
            const journalLabel = article.journal
              ? `Issue ${article.journal.issue ?? "N/A"} (${article.journal.year ?? "N/A"})`
              : article.issueNumber != null
                ? `Volume ${article.issueNumber}${article.year ? ` (${article.year})` : ""}`
                : "N/A";
            return (<TouchableOpacity key={article.id || `author-article-${index}`} onPress={() => navigation.navigate("Article", { item: article })}>
              <View style={styles.articlesContainer}>
              <View style={styles.articleInfo}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleAuthor}>in {journalLabel}</Text>
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
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No articles available yet.</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
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
    emptyContainer: {
      paddingTop: 40,
      paddingBottom: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontFamily: 'sans_semibold',
      fontSize: 18,
      color: '#303030',
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtext: {
      fontFamily: 'sans_regular',
      fontSize: 14,
      color: 'gray',
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