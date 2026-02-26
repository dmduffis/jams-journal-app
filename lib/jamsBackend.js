/**
 * JAMS Journal backend API – follows, notifications, push token.
 * All requests use Supabase access token: Authorization: Bearer <token>
 * and userId from session.user.id in the path.
 */

import { supabase } from "./supabase";

/** Base URL for JAMS backend (content + auth endpoints). */
export const JAMS_BACKEND_BASE_URL = "https://jams-journal-backend.up.railway.app";
const BASE_URL = JAMS_BACKEND_BASE_URL;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token || !session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

/**
 * Follows
 */
export async function getFollows() {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/follows`, { headers });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data?.authorIds) ? data.authorIds : [];
}

export async function addFollow(authorId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/follows`, {
    method: "POST",
    headers,
    body: JSON.stringify({ authorId: String(authorId) }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function removeFollow(authorId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/follows/${encodeURIComponent(String(authorId))}`, {
    method: "DELETE",
    headers,
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/**
 * Notifications
 */
export async function getNotifications(limit = 20) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const q = limit != null ? `?limit=${Math.min(Number(limit) || 20, 100)}` : "";
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications${q}`, { headers });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const raw = Array.isArray(data)
    ? data
    : data?.notifications ?? data?.data ?? data?.items ?? [];
  return Array.isArray(raw) ? raw.map(normalizeNotification) : [];
}

/** Pick first string URL from possible avatar fields (backend may use different names). */
function pickAvatarUrl(n) {
  const top =
    n.authorAvatar ?? n.author_avatar ?? n.author_avatar_url ?? n.author_image ?? n.author_profile_image;
  if (typeof top === "string" && top.trim()) return top.trim();
  const a = n.author;
  if (a && typeof a === "object") {
    const v =
      a.avatar ?? a.photo?.url ?? (typeof a.photo === "string" ? a.photo : null) ?? a.image ?? a.profile_image ?? a.picture ?? a.profile_image_url;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Normalize notification so app always sees camelCase and expected fields. */
function normalizeNotification(n) {
  if (!n || typeof n !== "object") return n;
  const authorAvatar = pickAvatarUrl(n);
  return {
    ...n,
    id: n.id,
    title: n.title ?? n.heading,
    body: n.body ?? n.message ?? n.content,
    articleId: n.articleId ?? n.article_id,
    authorId: n.authorId ?? n.author_id,
    authorName: n.authorName ?? n.author_name,
    articleTitle: n.articleTitle ?? n.article_title,
    readAt: n.readAt ?? n.read_at ?? n.read,
    createdAt: n.createdAt ?? n.created_at ?? n.created,
    authorAvatar,
    author:
      n.author && typeof n.author === "object"
        ? {
            ...n.author,
            firstName: n.author.firstName ?? n.author.first_name,
            lastName: n.author.lastName ?? n.author.last_name,
            avatar: authorAvatar ?? n.author.avatar ?? n.author.photo?.url ?? (typeof n.author.photo === "string" ? n.author.photo : null),
          }
        : n.author,
  };
}

export async function markNotificationRead(notificationId, read = true) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/notifications/${encodeURIComponent(notificationId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ read }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/**
 * Push token (optional – call when you have Expo push token)
 */
export async function registerPushToken(token, platform) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/push-token`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ token, platform }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/**
 * Bookmarks (saved articles).
 * All endpoints: Authorization: Bearer <session.access_token>, userId = session.user.id in path.
 */
export async function getBookmarks(limit = 50) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const q = limit != null ? `?limit=${Math.min(Number(limit) || 50, 100)}` : "";
  const res = await fetch(`${BASE_URL}/users/${userId}/bookmarks${q}`, { headers });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const raw = Array.isArray(data) ? data : data?.bookmarks ?? data?.data ?? data?.items ?? [];
  return Array.isArray(raw) ? raw.map(normalizeBookmark) : [];
}

function normalizeBookmark(b) {
  if (!b || typeof b !== "object") return b;
  const article = b.article ?? b.Article;
  return {
    articleId: b.articleId ?? b.article_id,
    createdAt: b.createdAt ?? b.created_at ?? b.created,
    article: article
      ? {
          id: article.id,
          title: article.title,
          slug: article.slug,
          createdAt: article.createdAt ?? article.created_at,
          authors: Array.isArray(article.authors) ? article.authors : article.author ? [article.author] : [],
        }
      : { id: b.articleId ?? b.article_id, title: null, slug: null, createdAt: null, authors: [] },
  };
}

/**
 * Bookmark (save) an article. Body must be exactly { "articleId": "<string>" }.
 * Uses session.user.id in URL and Authorization: Bearer <session.access_token>.
 */
export async function addBookmark(articleId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const id = String(articleId);
  const res = await fetch(`${BASE_URL}/users/${userId}/bookmarks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ articleId: id }),
  });
  if (res.status === 401) throw new Error("Not authenticated");
  if (res.status === 403) throw new Error("Unauthorized");
  if (res.status === 404) throw new Error("Article not found");
  if (!res.ok && res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function removeBookmark(articleId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${BASE_URL}/users/${userId}/bookmarks/${encodeURIComponent(String(articleId))}`,
    { method: "DELETE", headers }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/**
 * Likes
 */
export async function getLikes(limit = 50) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const q = limit != null ? `?limit=${Math.min(Number(limit) || 50, 100)}` : "";
  const res = await fetch(`${BASE_URL}/users/${userId}/likes${q}`, { headers });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data?.articleIds)) return data.articleIds.map(String);
  if (Array.isArray(data?.items))
    return data.items.map((x) => String(x.articleId ?? x.article_id ?? x.id ?? "")).filter((id) => id !== "");
  return [];
}

export async function addLike(articleId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}/users/${userId}/likes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ articleId: String(articleId) }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (res.status === 404) throw new Error("Article not found");
  if (!res.ok && res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function removeLike(articleId) {
  const userId = await getUserId();
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${BASE_URL}/users/${userId}/likes/${encodeURIComponent(String(articleId))}`,
    { method: "DELETE", headers }
  );
  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

/** Like count for an article (no auth). */
export async function getArticleLikesCount(articleId) {
  const res = await fetch(`${BASE_URL}/articles/${encodeURIComponent(String(articleId))}/likes/count`);
  if (!res.ok) return 0;
  try {
    const data = await res.json();
    const n = data?.count ?? data?.likes ?? 0;
    return typeof n === "number" ? Math.max(0, n) : 0;
  } catch (_e) {
    return 0;
  }
}

/** Bookmark/save count for an article (total users who saved it). Tries with auth first. */
export async function getArticleBookmarksCount(articleId) {
  const url = `${BASE_URL}/articles/${encodeURIComponent(String(articleId))}/bookmarks/count`;
  try {
    const headers = await getAuthHeaders().catch(() => ({}));
    const res = await fetch(url, { headers: Object.keys(headers).length ? headers : undefined });
    if (!res.ok) return 0;
    const data = await res.json();
    const n =
      typeof data === "number"
        ? data
        : data?.count ?? data?.bookmarks ?? data?.bookmarksCount ?? data?.total ?? data?.data?.count ?? 0;
    return typeof n === "number" ? Math.max(0, n) : 0;
  } catch (_e) {
    return 0;
  }
}
