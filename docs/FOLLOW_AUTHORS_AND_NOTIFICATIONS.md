# Follow Authors & New-Article Notifications

Plan for persisting follows and notifying users when a followed author publishes an article.

---

## Current State

- **Follow button**: Exists in `Author.jsx` and `AuthorDetails.jsx`; state lives in `AuthorContext` (in-memory only, lost on restart).
- **Authors**: Railway backend (`/authors`, `/articles`, …) and Hygraph GraphQL (author details + articles). Author `id` may come from either source depending on screen.
- **Auth**: Supabase; user id/email sent to Railway at signup (`POST /users`).

---

## Backend (Railway or Supabase)

### 1. Persist follows

- **Option A – Railway**
  - Add table: `author_follows` with `user_id` (Supabase auth uid), `author_id` (string; same id your app uses, e.g. Railway author id).
  - Endpoints:
    - `GET /users/:userId/follows` → `{ authorIds: string[] }`
    - `POST /users/:userId/follows` body `{ authorId }` → add follow
    - `DELETE /users/:userId/follows/:authorId` → remove follow
  - Auth: require valid Supabase JWT or session and ensure `userId` matches the authenticated user.

- **Option B – Supabase**
  - New table: `public.author_follows (user_id uuid, author_id text, created_at timestamptz, primary key (user_id, author_id))`.
  - RLS: users can only read/insert/delete their own rows.
  - No extra REST service; app uses Supabase client.

### 2. Know when an author publishes

- **Option A – Hygraph webhook**
  - If articles are created in Hygraph, add a webhook on “article published” that calls your backend with `articleId` and `authorIds`.
  - Backend: look up followers of those authors and queue notifications (push and/or in-app).

- **Option B – Railway is source of truth**
  - When a new article is added (CMS → Railway sync, or manual), backend gets `author_id`(s). Same flow: resolve followers → queue notifications.

- **Option C – Polling**
  - Cron job (e.g. every N minutes) fetches recent articles (from Hygraph or Railway), joins with `author_follows`, and creates notification records for followers.

### 3. Notifications

- **In-app only (simplest)**
  - Table: `notifications (id, user_id, type, title, body, article_id, author_id, read_at, created_at)`.
  - Endpoint: `GET /users/:userId/notifications?limit=20` (and optional `PATCH .../notifications/:id/read`).
  - App polls this on open or on interval; show badge/list in a Notifications screen or tab.

- **Push (Expo)**
  - Table: `push_tokens (user_id, token unique, platform, updated_at)`.
  - Endpoint: `PUT /users/:userId/push-token` body `{ token, platform }` (called from app after Expo gives a token).
  - When you create a notification for “new article by followed author”, call Expo Push API to send to that user’s token(s). Optionally still write to `notifications` for in-app history.

- **Email (optional)**
  - Store email from Supabase auth; when creating a notification, optionally send via SendGrid/Resend/etc.

---

## Frontend (React Native / Expo)

### 1. Follows: persist and sync

- **Use backend for source of truth**
  - On app load (user logged in): `GET /users/:userId/follows` (or Supabase `from('author_follows').select('author_id').eq('user_id', userId)`) and set `followedAuthors` in context (or replace in-memory list with this).
  - On Follow tap: call `POST .../follows` then update local state.
  - On Unfollow: call `DELETE .../follows/:authorId` then update local state.
- **Author ID**
  - Use one consistent id when following (e.g. always the `id` from the author object shown on that screen). Backend stores that same string so “new article by author X” can match.

### 2. Optional: cache follows locally

- After loading from backend, write `followedAuthors` to AsyncStorage (e.g. key `followed_${userId}`).
  - On launch, read from AsyncStorage first for instant UI, then refresh from backend and merge.

### 3. Notifications (in-app)

- **Data**
  - `GET /users/:userId/notifications` (or Supabase `from('notifications').select().eq('user_id', userId).order('created_at', { ascending: false })`).
- **UI**
  - Notifications tab or bell icon; list of items (e.g. “Author X published ‘Article title’”); tap → navigate to Article.
  - Optional: mark as read when opening the article or when opening the notification (PATCH or Supabase update).

### 4. Push (if you add it)

- Install: `expo-notifications`, `expo-device`.
- Request permission and get token; send to backend (`PUT /users/:userId/push-token`).
- Handle received/response in app (e.g. update badge, or in-app list).
- See [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/).

---

## Suggested order

1. **Backend**: Add follows table + endpoints (or Supabase table + RLS).
2. **Frontend**: Replace in-memory follow with API calls; load follows on login and use for Follow/Unfollow.
3. **Backend**: Add `notifications` table and logic to create a row when “new article by followed author” (webhook or cron).
4. **Frontend**: Notifications screen + API to fetch and mark read.
5. **Optional**: Push tokens + Expo Push; optional email.

---

## Summary table

| Piece | Backend | Frontend |
|-------|--------|----------|
| **Persist follows** | Table + GET/POST/DELETE (or Supabase) | Call API on Follow/Unfollow; load follows on app init |
| **New-article detection** | Webhook from CMS, or cron that checks new articles | — |
| **Notify users** | For each follower, insert into `notifications` (and optionally send push/email) | — |
| **In-app notifications** | GET notifications, PATCH read | Notifications screen/tab, fetch list, tap → Article |
| **Push** | Store push token; call Expo Push when creating notification | Request permission, send token to backend, handle incoming push |

If you tell me whether you prefer Railway vs Supabase for follows and whether you want in-app only or also push, I can outline exact API shapes and DB schemas next (or implement the frontend follow persistence first).

---

## Backend: Creating notifications when an article is published

**If users are not seeing notifications after publishing an article**, the backend is not yet creating notification rows. The app only **reads** notifications via `GET /users/:userId/notifications`; it does not create them.

The backend (e.g. Railway `jams-journal-backend`) must do the following whenever a new article is available to users (on publish, on sync, or via a scheduled job).

### 1. When to run

- **Option A – On article create/update**  
  When your CMS, admin, or sync process adds or publishes an article, call the notification logic right after saving the article (same service or a small internal function).

- **Option B – Cron job**  
  Every N minutes (e.g. 5–15), fetch articles that were created/updated since the last run (from your DB or from `GET /journals` and then each journal’s articles). For each such article, run the logic below.

### 2. For each new article

1. **Get author ids for the article**  
   From the article record you have (e.g. from Railway DB or from the journals API). Author ids may be in `article.authors[].author.id` or `article.author.id`. Collect all author ids for that article.

2. **Find followers of those authors**  
   Query your follows table (e.g. `author_follows` or whatever stores `user_id` + `author_id`).  
   `SELECT user_id FROM author_follows WHERE author_id IN (list of author ids from step 1)`.

3. **Create one notification per follower**  
   For each `user_id` from step 2, insert a row into your `notifications` table. The app expects at least:
   - `user_id`
   - `article_id` = the new article’s id (so the app can open it)
   - `title` – who did what (see **Notification copy** below)
   - `body` – article title (or use `articleTitle`; see below)
   - `created_at` = now  

   **Notification copy (recommended)** so the in-app notification reads clearly:
   - **Option A (preferred):** Send structured fields the app can format:
     - `authorName`: full author name (e.g. `"Boubakar Sanou"` or `firstName + " " + lastName`)
     - `articleTitle`: the article’s title (e.g. `"Shalom: Health, Healing, and Wholeness in Biblical Perspective"`)
     - The app will display: **"[Author name] posted a new article"** and below it the article title.
   - **Option B:** Send pre-formatted text:
     - `title`: e.g. `"Boubakar Sanou posted a new article"`
     - `body`: the article’s title  
   The app also accepts `author: { firstName, lastName }` instead of `authorName`.  
   Response shape: `id`, `title`, `body`, `articleId`, `readAt`, `createdAt` (see `screens/Notifications.jsx` and `lib/jamsBackend.js`).

4. **Optional – push**  
   If you store push tokens per user, for each notification you can also call the Expo Push API so the user gets a device notification.

### 3. Example (pseudo-code)

```text
function onArticlePublished(article) {
  const authorIds = getAuthorIdsFromArticle(article);  // e.g. [1, 4, 7]
  const followerUserIds = db.query(
    'SELECT user_id FROM author_follows WHERE author_id IN (?)', authorIds
  );
  for (const userId of followerUserIds) {
    db.insert('notifications', {
      user_id: userId,
      article_id: article.id,
      title: 'New article',
      body: article.title,
      created_at: new Date(),
    });
    // optionally: send Expo push to userId
  }
}
```

### 4. Author id format

Use the **same** author id the app uses when following (the `id` from `GET /authors` or from the author object in journal articles). Your follows table stores that id; when you resolve “followers of this article’s authors”, match on that same id.
