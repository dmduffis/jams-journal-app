# Backend: Article bookmark count (for “exact count” in app)

The app shows a **total bookmark count** under the bookmark icon on Popular Articles and on the Article screen. That number should be the count of **all users** who have bookmarked that article, not just the current user.

## Required endpoint

The app calls:

- **`GET /articles/:articleId/bookmarks/count`**

It should return the **total number of users** who have this article in their bookmarks (saved).

### Response shape (any of these is fine)

- `{ "count": 5 }`  ← preferred
- `{ "bookmarks": 5 }`
- `5` (raw number)

The app already normalizes `count`, `bookmarks`, `bookmarksCount`, `total`, and `data.count`. The response can be public (no auth required) or require the same `Authorization: Bearer <token>` as other JAMS endpoints; the app tries with auth when the user is logged in.

### Example

- Request: `GET https://jams-journal-backend.up.railway.app/articles/abc-123/bookmarks/count`
- Response: `{ "count": 3 }`

Then the app will show “3” (or “1.0k”, etc. via `formatCount`) under the bookmark icon.

## Backend implementation sketch

If you have a `bookmarks` (or `user_article_bookmarks`) table with `user_id` and `article_id`:

- **Count:** `SELECT COUNT(*) FROM bookmarks WHERE article_id = :articleId`
- Return `{ "count": <that number> }`.

Once this endpoint exists and returns the real total, the app will show the exact count without any further client changes.
