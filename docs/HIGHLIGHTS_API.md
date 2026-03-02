# Highlights – data shape and API

Highlights are saved text selections inside an article. Use the same auth as bookmarks/likes: **Authorization: Bearer &lt;session.access_token&gt;** and the path must use the current user’s id: **userId = session.user.id**.

**Article lookup:** The backend looks up the article by **UUID only** (`Article.id`). The frontend **must** send the article’s UUID as `articleId` (e.g. from `articleData.uuid` or whatever the articles API returns as the UUID). Sending a numeric id (e.g. `16112`) causes 404 Article not found. Create and list responses return that same UUID in `articleId` only.

**Article id for highlights:** Backend adds `uuid` to GET /articles (same as `id`). Use **article.uuid** or **article.id** as `articleId`; both are the same. Treat as opaque string (e.g. "16112" is valid); do not require a UUID regex.

**Request URL:** Must be `POST <baseUrl>/users/<userId>/highlights` with body `{ articleId: "<uuid>", text: "...", ... }`. If you see “Cannot POST /…” the route may be missing (e.g. backend not redeployed with highlights routes).

## Highlight object (from API)

```ts
type Highlight = {
  id: string;                 // UUID
  articleId: string;         // Article this highlight belongs to
  text: string;              // The selected snippet
  startOffset: number | null; // Start character index in article body (0-based)
  endOffset: number | null;   // End character index
  createdAt: string;         // ISO date, e.g. "2025-03-01T12:00:00.000Z"
};
```

## Endpoints

### List

**GET** `/users/:userId/highlights?articleId=<id>`

Returns an array of `Highlight`.

- **Omit** `articleId` for all of the user’s highlights.
- **Include** `articleId` to filter by article.

### Create

**POST** `/users/:userId/highlights`

**Headers:** `Authorization: Bearer <session.access_token>`, `Content-Type: application/json`

**Body:**
```json
{
  "articleId": "<article-uuid>",
  "text": "<selected snippet>",
  "startOffset": 0,
  "endOffset": 42
}
```

- **Required:** `articleId`, `text`
- **Optional:** `startOffset`, `endOffset` (numbers; recommended for re-rendering)

**Responses:**
- **201** – Created; body is the created highlight (id, articleId, text, startOffset, endOffset, createdAt).
- **400** – Missing text or articleId.
- **401** – Not authenticated.
- **404** – Article not found.

### Delete

**DELETE** `/users/:userId/highlights/:highlightId`

Returns **204** on success.

---

## Frontend usage

- **List view:** Call `GET /users/:userId/highlights` (and optionally `?articleId=...`) and render the array of `Highlight` (e.g. list of snippets with `text`, link to `articleId`, `createdAt`).
- **Article/reader view:** Call `GET /users/:userId/highlights?articleId=<articleId>` for that article, then use `startOffset` / `endOffset` (and `text`) to highlight the corresponding range in the article body (e.g. wrap that substring in a `<mark>` or styled span).
- **Create:** On text selection, send `POST /users/:userId/highlights` with `articleId`, selected `text`, and if you have them, `startOffset` / `endOffset`.
- **Delete:** Call `DELETE /users/:userId/highlights/:highlightId` when the user removes a highlight.

Treat `startOffset` / `endOffset` as character indices into the **plain-text** article body; if the body is stored as HTML, either use a plain-text representation for offsets or derive offsets from the same source you use to render the text.
