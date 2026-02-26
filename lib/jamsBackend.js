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

/** Normalize notification so app always sees camelCase and expected fields. */
function normalizeNotification(n) {
  if (!n || typeof n !== "object") return n;
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
    authorAvatar: n.authorAvatar ?? n.author_avatar ?? n.author?.avatar ?? n.author?.photo?.url ?? n.author?.photo,
    author:
      n.author && typeof n.author === "object"
        ? {
            ...n.author,
            firstName: n.author.firstName ?? n.author.first_name,
            lastName: n.author.lastName ?? n.author.last_name,
            avatar: n.author.avatar ?? n.author.photo?.url ?? n.author.photo,
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
