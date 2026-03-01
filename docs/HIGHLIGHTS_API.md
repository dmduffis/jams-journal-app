# Highlights API (backend contract)

The app saves **highlights** (selected text passages within an article). Implement these endpoints on the backend with the same auth as bookmarks/likes: `Authorization: Bearer <session.access_token>` and `userId = session.user.id` in the path.

---

## 1. List highlights

**Request**

- **Method:** `GET`
- **URL:** `/users/:userId/highlights`
- **Query (optional):** `articleId=<id>` – filter by article
- **Headers:** `Authorization: Bearer <token>`

**Response (200)**

JSON array of highlight objects (or `{ highlights: [...] }` / `{ data: [...] }`). Each item:

| Field        | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `id`        | string | Unique highlight id                  |
| `articleId` | string | Article (or `article_id`)             |
| `text`      | string | The selected snippet                 |
| `startOffset` | number | Start character index in body text (or `start_offset`) |
| `endOffset` | number | End character index (or `end_offset`) |
| `createdAt` | string | ISO date (optional)                  |

---

## 2. Create a highlight

**Request**

- **Method:** `POST`
- **URL:** `/users/:userId/highlights`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**

```json
{
  "articleId": "<string>",
  "text": "<selected snippet>",
  "startOffset": 0,
  "endOffset": 42
}
```

- `text` is required; `startOffset` and `endOffset` are optional but recommended for re-rendering highlights.

**Response**

- **201:** Created. Body: highlight object (or `{ highlight: { ... } }`) with `id`, `articleId`, `text`, `startOffset`, `endOffset`, and optionally `createdAt`.
- **401:** Not authenticated
- **404:** Article not found

---

## 3. Delete a highlight

**Request**

- **Method:** `DELETE`
- **URL:** `/users/:userId/highlights/:highlightId`
- **Headers:** `Authorization: Bearer <token>`

**Response**

- **204:** No content (success)
- **401/403:** Unauthorized

---

## Suggested storage

- Table (e.g. `highlights`): `id`, `user_id`, `article_id`, `text`, `start_offset`, `end_offset`, `created_at`.
- Index on `(user_id, article_id)` for listing by user and by article.
