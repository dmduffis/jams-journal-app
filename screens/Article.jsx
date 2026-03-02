import { View, Text, StyleSheet, Image, ScrollView, useWindowDimensions, TouchableOpacity, Alert, ActivityIndicator, Animated, LayoutAnimation } from 'react-native'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import RenderHtml from 'react-native-render-html';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';
import { marked } from 'marked';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ArticleAuthors from '../components/ArticleAuthors';
import { useBookmarks } from '../context/BookmarkContext';
import { useHighlights } from '../context/HighlightContext';
import { useLikes } from '../context/LikeContext';
import { getArticleLikesCount, getArticleBookmarksCount, JAMS_BACKEND_BASE_URL } from '../lib/jamsBackend';
import { formatCount } from '../lib/formatCount';

const ID_FIELD_NAMES = ["uuid", "id", "articleId"];
/** Article id for highlights: backend accepts article.uuid or article.id (same value; opaque string, e.g. "16112"). */
function getArticleIdFromResponse(data) {
  if (!data || typeof data !== "object") return null;
  const pick = (d) => {
    if (!d || typeof d !== "object") return null;
    for (const key of ID_FIELD_NAMES) {
      const v = d[key];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };
  return pick(data) ?? pick(data?.article) ?? pick(data?.data) ?? null;
}

function BounceIconButton({ onPress, style, hitSlop, children }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.10, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 200 }),
    ]).start();
    onPress?.();
  };
  return (
    <TouchableOpacity onPress={handlePress} style={style} hitSlop={hitSlop} activeOpacity={1}>
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// Define system fonts for HTML rendering
const systemFonts = [
  'serif_regular',
  'serif_bold',
  'serif_italic',
  'sans_regular',
  'sans_bold',
  'sans_semibold',
];

// Styles for HTML tags
const tagsStyles = {
  body: {
    fontSize: 16,
    fontFamily: 'serif_regular',
    lineHeight: 32,
    color: '#333',
  },
  p: {
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'serif_regular',
    lineHeight: 32,
  },
  h1: {
    fontSize: 35,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
    marginTop: 20,
    marginBottom: 15,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 30,
    marginBottom: 10,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 30,
    marginBottom: 10,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
    marginTop: 20,
    marginBottom: 10,
  },
  em: {
    fontFamily: 'serif_italic',
  },
  i: {
    fontFamily: 'serif_italic',
  },
  strong: {
    fontFamily: 'serif_bold',
    fontWeight: 'bold',
  },
  b: {
    fontFamily: 'serif_bold',
    fontWeight: 'bold',
  },
  table: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  thead: {
    backgroundColor: '#357db5',
  },
  th: {
    padding: 12,
    fontFamily: 'sans_bold',
    fontSize: 14,
    color: '#fff',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
  },
  td: {
    padding: 12,
    fontFamily: 'serif_regular',
    fontSize: 14,
    lineHeight: 22,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  blockquote: {
    fontSize: 15,
    fontFamily: 'serif_italic',
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#357db5',
    marginVertical: 10,
  },
  ul: {
    marginTop: 10,
  },
  ol: {
    marginTop: 10,
  },
  li: {
    marginBottom: 5,
  },
};

// Skeleton placeholder that mimics article layout (title, author, body lines)
function ArticleSkeleton({ style }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={[skeletonStyles.container, style]}>
      <Animated.View style={[skeletonStyles.titleBar, { opacity: pulse }]} />
      <View style={skeletonStyles.authorRow}>
        <Animated.View style={[skeletonStyles.avatar, { opacity: pulse }]} />
        <Animated.View style={[skeletonStyles.authorLine, { opacity: pulse }]} />
      </View>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Animated.View
          key={i}
          style={[
            skeletonStyles.bodyLine,
            i === 3 && skeletonStyles.bodyLineShort,
            { opacity: pulse },
          ]}
        />
      ))}
    </View>
  );
}

// Compact skeleton for body-only loading (WebView loading)
function BodySkeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={skeletonStyles.bodyContainer}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Animated.View
          key={i}
          style={[
            skeletonStyles.bodyLine,
            i % 4 === 0 && skeletonStyles.bodyLineShort,
            { opacity: pulse },
          ]}
        />
      ))}
    </View>
  );
}

const Article = () => {
  const [articleData, setArticleData] = useState(null);
  const navigation = useNavigation();
  const routes = useRoute();
  const { item } = routes.params;
  const { width } = useWindowDimensions();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isLiked, toggleLike } = useLikes();
  const { fetchForArticle, addHighlight, removeHighlight, getHighlightsForArticle } = useHighlights();
  const articleId = articleData?.id ?? item?.id;
  /** Article id for highlights: use article.uuid or article.id (backend accepts either; same value, opaque string). */
  const articleHighlightId =
    (articleData?.uuid != null ? String(articleData.uuid).trim() : null)
    ?? (articleData?.id != null ? String(articleData.id).trim() : null)
    ?? getArticleIdFromResponse(articleData)
    ?? (item?.id != null ? String(item.id).trim() : null);
  const saved = isBookmarked(articleId);
  const liked = isLiked(articleId);
  const [likeCount, setLikeCount] = useState(null);
  const [saveCount, setSaveCount] = useState(null);
  const webViewRef = useRef(null);
  const lastHighlightTapRef = useRef({ id: null, at: 0 });
  const [articleBodyHeight, setArticleBodyHeight] = useState(800);
  const [bodyLoaded, setBodyLoaded] = useState(false);
  const [showHighlightBar, setShowHighlightBar] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [highlightBarLabel, setHighlightBarLabel] = useState('Save highlight');
  const [removeBarLabel, setRemoveBarLabel] = useState('Remove highlight');
  const [pendingDeleteHighlightId, setPendingDeleteHighlightId] = useState(null);
  const articleHighlights = articleHighlightId != null ? getHighlightsForArticle(articleHighlightId) : [];

  const getArticleDetails = async () => {
    try {
      const response = await fetch(
        `${JAMS_BACKEND_BASE_URL}/articles/${item.id}`
      );
      const data = await response.json();
      
      if (data) {
        const article = data.article ?? data.data ?? data;
        if (article && !article.uuid) {
          const fromTop = data.uuid ?? data.article?.uuid ?? data.data?.uuid;
          if (fromTop != null) article.uuid = typeof fromTop === "string" ? fromTop.trim() : String(fromTop);
        }
        if (__DEV__) console.warn("[Article] article.uuid:", article?.uuid, "keys:", article ? Object.keys(article) : []);
        if (article.authors && Array.isArray(article.authors)) {
          article.authors = article.authors
            .map(authorItem => {
              const author = authorItem.author || authorItem;
              if (author) {
                author.avatar = author.avatar
                  || author.photo?.url
                  || (typeof author.photo === "string" ? author.photo : null);
              }
              return author;
            })
            .filter(author => author);
        } else if (article.author) {
          const author = article.author;
          author.avatar = author.avatar
            || author.photo?.url
            || (typeof author.photo === "string" ? author.photo : null);
          article.authors = [author];
        } else {
          article.authors = [];
        }
        setArticleData(article);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  useEffect(() => {
    getArticleDetails();
  }, [item.id]);

  useEffect(() => {
    if (!articleId) return;
    getArticleLikesCount(articleId).then(setLikeCount);
    getArticleBookmarksCount(articleId).then(setSaveCount);
  }, [articleId]);

  const prevLikeCountRef = useRef(likeCount);
  const prevSaveCountRef = useRef(saveCount);
  useEffect(() => {
    const hadLikeCount = prevLikeCountRef.current != null && prevLikeCountRef.current > 0;
    const hasLikeCount = likeCount != null && likeCount > 0;
    const hadSaveCount = prevSaveCountRef.current != null && prevSaveCountRef.current > 0;
    const hasSaveCount = saveCount != null && saveCount > 0;
    if ((!hadLikeCount && hasLikeCount) || (!hadSaveCount && hasSaveCount)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    prevLikeCountRef.current = likeCount;
    prevSaveCountRef.current = saveCount;
  }, [likeCount, saveCount]);

  useEffect(() => {
    if (!articleHighlightId) return;
    fetchForArticle(articleHighlightId);
  }, [articleHighlightId, fetchForArticle]);

  const insets = useSafeAreaInsets();

  // Convert superscript notation to unicode superscript characters
  const formatContent = (content) => {
    if (!content) return '';
    const superscriptMap = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    // Convert ^1^ or [^1] to unicode superscript
    return content
      .replace(/\^\^?(\d+)\^\^?/g, (match, num) => 
        num.split('').map(d => superscriptMap[d] || d).join('')
      )
      .replace(/\[\^(\d+)\]/g, (match, num) => 
        num.split('').map(d => superscriptMap[d] || d).join('')
      );
  };

  // Split content into markdown and HTML table segments
  const parseContent = (content) => {
    if (!content) return [];
    
    const formattedContent = formatContent(content);
    const segments = [];
    
    // Regex to match HTML tables
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    let lastIndex = 0;
    let match;
    
    while ((match = tableRegex.exec(formattedContent)) !== null) {
      // Add markdown content before the table
      if (match.index > lastIndex) {
        const markdownContent = formattedContent.substring(lastIndex, match.index).trim();
        if (markdownContent) {
          segments.push({ type: 'markdown', content: markdownContent });
        }
      }
      
      // Add the HTML table
      segments.push({ type: 'html', content: match[0] });
      lastIndex = tableRegex.lastIndex;
    }
    
    // Add any remaining markdown content after the last table
    if (lastIndex < formattedContent.length) {
      const markdownContent = formattedContent.substring(lastIndex).trim();
      if (markdownContent) {
        segments.push({ type: 'markdown', content: markdownContent });
      }
    }
    
    // If no tables found, return all content as markdown
    if (segments.length === 0) {
      segments.push({ type: 'markdown', content: formattedContent });
    }
    
    return segments;
  };

  // Full HTML for WebView body (markdown segments converted via marked)
  const fullHtml = useMemo(() => {
    if (!articleData?.content) return '';
    const segments = parseContent(articleData.content);
    const bodyHtml = segments
      .map((seg) => (seg.type === 'markdown' ? marked.parse(seg.content) : seg.content))
      .join('');
    const baseCss = 'body{font-size:16px;line-height:32px;color:#333;font-family:system-ui,-apple-system,sans-serif;margin:0;padding:0;} p{margin-bottom:15px;} h1{font-size:28px;margin:20px 0 15px;} h2{font-size:22px;margin:24px 0 10px;} h3,h4{font-size:18px;margin:20px 0 10px;} table{border-collapse:collapse;width:100%;margin:16px 0;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#357db5;color:#fff;} mark{background:rgba(53,125,181,0.35);}';
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}</style></head><body id="article-body">${bodyHtml}</body></html>`;
  }, [articleData?.content]);

  const webViewSource = useMemo(() => (fullHtml ? { html: fullHtml } : null), [fullHtml]);

  const getSelectionOffsets = useMemo(
    () => `
(function() {
  function getOffsets() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    var range = sel.getRangeAt(0);
    var body = document.body;
    if (!body.contains(range.commonAncestorContainer)) return null;
    var r = document.createRange();
    r.selectNodeContents(body);
    r.setEnd(range.startContainer, range.startOffset);
    var startOffset = r.toString().length;
    var endOffset = startOffset + range.toString().length;
    return { text: range.toString().trim(), startOffset: startOffset, endOffset: endOffset };
  }
  function applyHighlights(highlights) {
    if (!window.__articleBodyHtml) window.__articleBodyHtml = document.body.innerHTML;
    document.body.innerHTML = window.__articleBodyHtml;
    if (!highlights || !highlights.length) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    while (walker.nextNode()) textNodes.push({ node: walker.currentNode, len: walker.currentNode.textContent.length });
    function getNodeAt(offset) {
      var pos = 0;
      for (var i = 0; i < textNodes.length; i++) {
        if (offset <= pos + textNodes[i].len) return { node: textNodes[i].node, offset: Math.min(offset - pos, textNodes[i].len) };
        pos += textNodes[i].len;
      }
      return null;
    }
    highlights.sort(function(a,b) { return (a.startOffset||0) - (b.startOffset||0); });
    for (var i = 0; i < highlights.length; i++) {
      var h = highlights[i];
      var start = getNodeAt(h.startOffset || 0);
      var end = getNodeAt(h.endOffset || h.startOffset || 0);
      if (!start || !end) continue;
      var range = document.createRange();
      range.setStart(start.node, start.offset);
      range.setEnd(end.node, Math.min(end.offset, end.node.textContent.length));
      try {
        var mark = document.createElement('mark');
        range.surroundContents(mark);
        if (h.id && window.ReactNativeWebView) {
          var hid = h.id;
          mark.setAttribute('data-highlight-id', hid);
          mark.style.cursor = 'pointer';
          function sendTap(highlightId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'highlightTap', highlightId: highlightId }));
          }
          mark.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            sendTap(hid);
          });
          mark.addEventListener('touchend', function(ev) {
            if (ev.target === mark) {
              ev.preventDefault();
              ev.stopPropagation();
              sendTap(hid);
            }
          });
        }
      } catch (e) {}
    }
  }
  window.__getSelectionOffsets = getOffsets;
  window.__applyHighlights = applyHighlights;
  function notifySelection() {
    var o = getOffsets();
    if (!window.ReactNativeWebView) return;
    if (o && o.text) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selection', text: o.text, startOffset: o.startOffset, endOffset: o.endOffset }));
    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selectionCleared' }));
    }
  }
  document.addEventListener('selectionchange', function() { setTimeout(notifySelection, 100); });
  document.addEventListener('mouseup', function() { setTimeout(notifySelection, 100); });
  document.addEventListener('touchend', function() { setTimeout(notifySelection, 150); });
  if (document.readyState === 'complete') {
    setTimeout(function() {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: document.body.scrollHeight }));
    }, 100);
  } else {
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: document.body.scrollHeight }));
      }, 100);
    });
  }
})();
`,
    []
  );

  const handleWebViewMessage = useCallback(
    async (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data || '{}');
        if (data.type === 'height' && typeof data.value === 'number') {
          setArticleBodyHeight(Math.max(400, data.value + 40));
          return;
        }
        if (data.type === 'selection' && data.text) {
          setPendingSelection({ text: data.text, startOffset: data.startOffset, endOffset: data.endOffset });
          setHighlightBarLabel('Save highlight');
          setShowHighlightBar(true);
          setPendingDeleteHighlightId(null);
          return;
        }
        if (data.type === 'selectionCleared') {
          setShowHighlightBar(false);
          setPendingSelection(null);
          setPendingDeleteHighlightId(null);
          return;
        }
        if (data.type === 'highlight' && data.text && articleHighlightId) {
          const startOffset = data.startOffset;
          const endOffset = data.endOffset;
          const hasOffsets = startOffset != null && endOffset != null;
          const optimisticHighlight = hasOffsets ? { startOffset, endOffset, id: `pending-${Date.now()}` } : null;
          const listForDisplay = optimisticHighlight ? [...articleHighlights, optimisticHighlight] : articleHighlights;
          const payloadNow = listForDisplay.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
          webViewRef.current?.injectJavaScript(
            `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payloadNow)}); true;`
          );
          try {
            const created = await addHighlight(articleHighlightId, {
              text: data.text,
              startOffset: data.startOffset,
              endOffset: data.endOffset,
            });
            const payloadFinal = [...articleHighlights, created].filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
            webViewRef.current?.injectJavaScript(
              `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payloadFinal)}); true;`
            );
            setHighlightBarLabel('Saved');
            setTimeout(() => { setShowHighlightBar(false); setPendingSelection(null); }, 1200);
          } catch (err) {
            webViewRef.current?.injectJavaScript(
              `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(articleHighlights.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id })))}); true;`
            );
            Alert.alert(
              'Could not save highlight',
              err?.message === 'Not authenticated' ? 'Sign in to save highlights.' : err?.message ?? 'The server may not support highlights yet. Try again later.'
            );
          }
          return;
        }
        if (data.type === 'highlightTap' && data.highlightId && articleHighlightId) {
          const now = Date.now();
          if (lastHighlightTapRef.current.id === data.highlightId && now - lastHighlightTapRef.current.at < 800) return;
          lastHighlightTapRef.current = { id: data.highlightId, at: now };
          setShowHighlightBar(false);
          setPendingSelection(null);
          setRemoveBarLabel('Remove highlight');
          setPendingDeleteHighlightId(data.highlightId);
          return;
        }
      } catch (e) {
        if (e?.message || e?.nativeEvent?.data) {
          Alert.alert('Highlight', e?.message ?? 'Something went wrong.');
        }
      }
    },
    [articleHighlightId, articleHighlights, addHighlight, removeHighlight, fetchForArticle]
  );

  const handleRemoveHighlightPress = useCallback(async () => {
    if (!pendingDeleteHighlightId || !articleHighlightId) return;
    const highlightId = pendingDeleteHighlightId;
    setRemoveBarLabel('Removed');
    try {
      const updatedList = articleHighlights.filter((h) => h.id !== highlightId);
      const payload = updatedList.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
      webViewRef.current?.injectJavaScript(
        `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payload)}); true;`
      );
      await removeHighlight(highlightId, articleHighlightId);
      setTimeout(() => {
        setPendingDeleteHighlightId(null);
        setRemoveBarLabel('Remove highlight');
      }, 1200);
    } catch (e) {
      setRemoveBarLabel('Remove highlight');
      Alert.alert('Could not remove highlight', e?.message ?? 'Try again later.');
    }
  }, [articleHighlightId, articleHighlights, pendingDeleteHighlightId, removeHighlight]);

  const handleSaveHighlightPress = useCallback(async () => {
    if (!pendingSelection?.text) return;
    if (!articleHighlightId) {
      Alert.alert("Can't save highlight", "Article ID is missing. Use GET /articles or GET /articles/:id from this backend so the article has id/uuid for highlights.");
      return;
    }
    const text = pendingSelection.text;
    const startOffset = pendingSelection.startOffset;
    const endOffset = pendingSelection.endOffset;
    const hasOffsets = startOffset != null && endOffset != null;
    const optimisticHighlight = hasOffsets ? { startOffset, endOffset, id: `pending-${Date.now()}` } : null;
    const listForDisplay = optimisticHighlight ? [...articleHighlights, optimisticHighlight] : articleHighlights;
    const payloadNow = listForDisplay.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
    webViewRef.current?.injectJavaScript(
      `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payloadNow)}); true;`
    );
    webViewRef.current?.injectJavaScript('(function(){ if(window.getSelection()) window.getSelection().removeAllRanges(); })(); true;');
    try {
      const created = await addHighlight(articleHighlightId, {
        text,
        startOffset,
        endOffset,
      });
      const payloadFinal = [...articleHighlights, created].filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
      webViewRef.current?.injectJavaScript(
        `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payloadFinal)}); true;`
      );
      setHighlightBarLabel('Saved');
      setTimeout(() => {
        setShowHighlightBar(false);
        setPendingSelection(null);
      }, 1200);
    } catch (err) {
      webViewRef.current?.injectJavaScript(
        `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(articleHighlights.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id })))}); true;`
      );
      Alert.alert(
        'Could not save highlight',
        err?.message === 'Not authenticated' ? 'Sign in to save highlights.' : err?.message ?? 'The server may not support highlights yet. Try again later.'
      );
    }
  }, [articleHighlightId, articleHighlights, pendingSelection, addHighlight]);

  const handleWebViewLoadEnd = useCallback(() => {
    setBodyLoaded(true);
    const payload = articleHighlights.filter((h) => h.startOffset != null && h.endOffset != null).map((h) => ({ startOffset: h.startOffset, endOffset: h.endOffset, id: h.id }));
    const script = `window.__applyHighlights && window.__applyHighlights(${JSON.stringify(payload)}); true;`;
    setTimeout(() => webViewRef.current?.injectJavaScript(script), 150);
  }, [articleHighlights]);

  useEffect(() => {
    setBodyLoaded(false);
  }, [fullHtml]);

  const useWebView = articleId != null && !!fullHtml;
  const contentReady = !useWebView || bodyLoaded;

  if (!articleData) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.statusBarFill, { height: insets.top }]} />
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#357db5" />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <ArticleSkeleton />
        </ScrollView>
      </View>
    );
  }

  const contentBlock = (
    <View
      style={
        contentReady
          ? undefined
          : {
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              height: 600,
              opacity: 0,
              overflow: 'hidden',
              zIndex: -1,
            }
      }
    >
      <Text style={styles.title}>{articleData.title}</Text>
      <View>
        {articleData.authors && articleData.authors.length > 0 &&
          articleData.authors.map((author, index) => {
            const normalizedAuthor = {
              ...author,
              firstName: author.firstName || (author.name ? author.name.split(' ')[0] : ''),
              lastName: author.lastName || (author.name ? author.name.split(' ').slice(1).join(' ') : ''),
              avatar: author.avatar || author.photo?.url || author.photo,
            };
            return (
              <ArticleAuthors author={normalizedAuthor} key={author.id || `article-author-${index}`} />
            );
          })}
        {!articleData.authors && articleData.author && (
          <ArticleAuthors
            author={{
              ...articleData.author,
              firstName: articleData.author.firstName || (articleData.author.name ? articleData.author.name.split(' ')[0] : ''),
              lastName: articleData.author.lastName || (articleData.author.name ? articleData.author.name.split(' ').slice(1).join(' ') : ''),
              avatar: articleData.author.avatar || articleData.author.photo?.url || articleData.author.photo,
            }}
            key={articleData.author.id || 'single-author'}
          />
        )}
      </View>
      {useWebView ? (
        <View style={[styles.articleBody, { height: bodyLoaded ? articleBodyHeight : 400 }]}>
          <WebView
            ref={webViewRef}
            source={webViewSource}
            style={styles.webView}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            injectedJavaScript={getSelectionOffsets}
            onMessage={handleWebViewMessage}
            onLoadEnd={handleWebViewLoadEnd}
            originWhitelist={['*']}
          />
        </View>
      ) : (
        <View>
          {parseContent(articleData.content || '').map((segment, index) => {
            if (segment.type === 'markdown') {
              return (
                <Markdown key={index} style={markdownStyles}>
                  {segment.content}
                </Markdown>
              );
            }
            if (segment.type === 'html') {
              return (
                <RenderHtml
                  key={index}
                  contentWidth={width - 40}
                  source={{ html: segment.content }}
                  tagsStyles={tagsStyles}
                  systemFonts={systemFonts}
                />
              );
            }
            return null;
          })}
        </View>
      )}
      {articleId != null && (
        <View style={styles.enjoyedCta}>
          <Text style={styles.enjoyedCtaText} numberOfLines={2}>
            Enjoyed this article? Consider liking it to support the author.
          </Text>
          <View style={styles.enjoyedCtaRow}>
            <BounceIconButton
              onPress={async () => {
                await toggleLike(articleId);
                getArticleLikesCount(articleId).then(setLikeCount);
              }}
              style={styles.enjoyedCtaLikeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#e74c3c' : '#357db5'} />
            </BounceIconButton>
            {likeCount != null && likeCount > 0 && (
              <Text style={styles.enjoyedCtaCount}>{formatCount(likeCount)}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color="#357db5" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        {articleId != null && (
          <View style={styles.headerBookmarkRow}>
            <View style={styles.headerIconWithCount}>
              <BounceIconButton
                onPress={async () => {
                  await toggleLike(articleId);
                  getArticleLikesCount(articleId).then(setLikeCount);
                }}
                style={styles.headerActionButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#e74c3c' : '#357db5'} />
              </BounceIconButton>
              {likeCount != null && likeCount > 0 && (
                <Text style={styles.headerCountText}>{formatCount(likeCount)}</Text>
              )}
            </View>
            <View style={styles.headerIconWithCount}>
              <BounceIconButton
                onPress={async () => {
                  const meta = { title: articleData?.title, slug: articleData?.slug, authors: articleData?.authors };
                  await toggleBookmark(articleId, meta);
                  getArticleBookmarksCount(articleId).then(setSaveCount);
                }}
                style={styles.bookmarkButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={26} color="#357db5" />
              </BounceIconButton>
              {saveCount != null && saveCount > 0 && (
                <Text style={styles.headerCountText}>{formatCount(saveCount)}</Text>
              )}
            </View>
          </View>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {!contentReady && <ArticleSkeleton />}
        {contentBlock}
      </ScrollView>
    {showHighlightBar && pendingSelection?.text ? (
      <View style={[styles.highlightBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.highlightBarButton}
          onPress={handleSaveHighlightPress}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark" size={20} color="#fff" />
          <Text style={styles.highlightBarLabel}>{highlightBarLabel}</Text>
        </TouchableOpacity>
      </View>
    ) : null}
    {pendingDeleteHighlightId ? (
      <View style={[styles.highlightBar, styles.highlightBarRemove, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.highlightBarButton}
          onPress={handleRemoveHighlightPress}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.highlightBarLabel}>{removeBarLabel}</Text>
        </TouchableOpacity>
      </View>
    ) : null}
    </View>
  );
}

export default Article

// Markdown-specific styles
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16, 
    fontFamily: 'serif_regular',
    lineHeight: 32,
    paddingBottom: 20,
  },
  heading1: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  heading2: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading3: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'sans_semibold',
  },
  heading4: {
    paddingTop: 30,
    fontWeight: 'bold',
    fontFamily: 'sans_semibold',
  },
  em: {
    fontFamily: 'serif_italic'
  },
  i: {
    fontFamily: 'serif_italic'
  },
  strong: {
    fontFamily: 'serif_bold'
  },
  blockquote: {
    fontSize: 15,
    backgroundColor: 'none',
    borderLeftWidth: 'none',
    paddingRight: 20,
  },
  ordered_list: {
    marginTop: 10,
  },
  order_list_icon: {
    marginTop: 10,
  }
});

// Regular styles for the component
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarFill: {
    backgroundColor: '#fff',
    width: '100%',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: 4,
  },
  headerBookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerActionButton: {
    padding: 4,
    marginLeft: 4,
  },
  headerCountText: {
    fontFamily: 'sans_regular',
    fontSize: 14,
    color: '#666',
  },
  backLabel: {
    fontFamily: 'sans_semibold',
    fontSize: 17,
    color: '#357db5',
    marginLeft: 2,
  },
  container: {
    flex: 1,
    paddingTop: 24,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 50,
    backgroundColor: '#fff',
  },
  articleBody: {
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webViewHidden: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bodyLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 30,
    paddingBottom: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'sans_semibold',
    lineHeight: 40,
  },
  enjoyedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  enjoyedCtaText: {
    flex: 1,
    fontFamily: 'serif_regular',
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 24,
    marginRight: 24,
  },
  enjoyedCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enjoyedCtaLikeButton: {
    padding: 4,
  },
  enjoyedCtaCount: {
    fontFamily: 'sans_regular',
    fontSize: 14,
    color: '#666',
  },
  highlightBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#357db5',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  highlightBarRemove: {
    backgroundColor: '#c0392b',
  },
  highlightBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  highlightBarLabel: {
    fontFamily: 'sans_semibold',
    fontSize: 16,
    color: '#fff',
  },
});

const skeletonStyles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  titleBar: {
    height: 32,
    borderRadius: 6,
    backgroundColor: '#e8e8e8',
    marginBottom: 20,
    width: '90%',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
    marginRight: 12,
  },
  authorLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e8e8e8',
    width: 140,
  },
  bodyLine: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#e8e8e8',
    marginBottom: 12,
    width: '100%',
  },
  bodyLineShort: {
    width: '75%',
  },
  bodyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
