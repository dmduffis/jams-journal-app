# AI Chat Assistant Implementation Guide

## Overview
This document provides the complete specification for implementing an AI-powered research assistant for the JAMS journal app. The assistant uses RAG (Retrieval Augmented Generation) to answer questions about journal articles using semantic search and OpenAI.

### Data Flow: How Citations Get to the AI

```
User Question
    ↓
1. Generate Embedding (OpenAI)
    ↓
2. Vector Search → Returns article_ids + chunk_text
    ↓
3. Database Join → Fetch Article + Citation + Authors + Journal
    ↓                 (This is where citation data comes from!)
4. Merge Data → article_id + chunk_text + citation + authors + year
    ↓
5. Build Context → Include "Full Citation: ..." in prompt
    ↓
6. Send to OpenAI → AI reads citation from context
    ↓
7. AI Response → Uses citations (Bauer, 2023)
    ↓
8. Return to Frontend → Response + sources with citations
```

**Key Point:** Citations come from the **Article table** via a database join, NOT from embedding metadata. This ensures citations are always up-to-date.

---

## Backend Implementation

### **POST /chat** Endpoint

**URL**: `https://jams-journal-backend.up.railway.app/chat`

#### Request Format
```json
{
  "message": "string (required) - The user's question/message",
  "conversationHistory": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

**Note**: `conversationHistory` is optional but recommended for context-aware follow-up questions.

#### Implementation Steps

##### 1. Retrieve Relevant Context with Citation Data

Use the user's message to perform semantic search, then enrich with article metadata:

```javascript
// Step 1: Generate embedding for user's message
const embeddingResponse = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: message
});
const queryEmbedding = embeddingResponse.data[0].embedding;

// Step 2: Search vector database for relevant article chunks
const { data: vectorResults } = await supabase.rpc('match_articles', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 10  // Retrieve more chunks to ensure diverse article coverage
  // Note: Multiple chunks may come from the same article,
  // so retrieving 10 chunks might yield 3-7 unique articles
});

// Step 3: Get unique article IDs from search results
const articleIds = [...new Set(vectorResults.map(result => result.article_id))];

// Step 4: Fetch complete article data including citations
// This is where you get citation, authors, journal info, etc.
const articles = await prisma.article.findMany({
  where: { 
    id: { in: articleIds } 
  },
  select: {
    id: true,
    title: true,
    citation: true,        // ← CRITICAL: Full citation from Article table
    authors: {
      select: {
        firstName: true,
        lastName: true
      }
    },
    journal: {
      select: {
        year: true,
        issueNumber: true,
        title: true
      }
    }
  }
});

// Step 5: Merge vector search results with article data
const relevantChunks = vectorResults.map(result => {
  const article = articles.find(a => a.id === result.article_id);
  return {
    content: result.chunk_text || result.content,
    similarity: result.similarity,
    article: article  // Now includes citation, authors, journal info
  };
});
```

**Why Join with Article Table?**
- ✅ Always get fresh citation data
- ✅ No need to re-embed when citations change
- ✅ Can access related data (authors, journal)
- ✅ Extra query is fast (only 3-5 articles per request)

**What's Now Available in Context:**
- Article title
- Article authors (with first and last names)
- **Full citation** (from the `citation` field in Article table)
- Publication year (from related Journal table)
- Matched text chunk
- Journal information (volume, issue, title)
- Article ID (for source links)

##### 2. Build the System Prompt with Citation Data

Now that you have enriched chunks with full article data (from the join in Step 1), build the context:

```javascript
const systemPrompt = `You are an AI research assistant for the Journal of Adventist Mission Studies (JAMS).

Your role is to:
- Help users understand and explore academic articles about mission studies
- Answer questions from a Seventh-day Adventist theological perspective
- Ground responses in Adventist mission theology and biblical principles
- Answer questions based ONLY on the context provided from journal articles
- If the context doesn't contain relevant information, say so honestly
- When citing information, mention the article title and authors
- Be conversational but academically accurate
- Respect the theological foundations of Adventist mission work

Context from our journal articles:

${relevantChunks.map((chunk, i) => {
  // Extract citation info from the joined article data
  const authorNames = chunk.article.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ');
  const year = chunk.article.journal?.year || 'n.d.';
  const citation = chunk.article.citation || 'Citation not available';
  
  return `
Source ${i + 1}:
Article: "${chunk.article.title}"
Authors: ${authorNames}
Year: ${year}
Full Citation: ${citation}
Content: ${chunk.content}
---
  `;
}).join('\n')}

Guidelines:
- Respond from a Seventh-day Adventist theological perspective
- For in-text citations, extract (Author, Year) from the "Full Citation" field
  * For single author: (Bauer, 2023)
  * For multiple authors: (Sanou & Tompkins, 2022)
  * When mentioning author in text: "As Bauer (2023) notes..."
- When asked for complete citations, provide the EXACT "Full Citation" as given
- Do not make up citations - use only the "Full Citation" provided
- Cite sources when referencing specific claims or concepts
- If multiple articles discuss the topic, mention all relevant ones
- Don't make up information not present in the context
- Be helpful and encourage further exploration of the journal
- Use markdown formatting for better readability:
  * **Bold** for emphasis
  * *Italic* for terms or titles
  * - Bullet points for lists
  * > Blockquotes for article excerpts
  * \`code\` for technical terms
`;
```

##### 3. Call OpenAI API

```javascript
const messages = [
  { role: 'system', content: systemPrompt },
  ...conversationHistory.slice(-10), // Last 10 messages for context
  { role: 'user', content: message }
];

const completion = await openai.chat.completions.create({
  model: 'gpt-4', // or 'gpt-3.5-turbo' for faster/cheaper responses
  messages: messages,
  temperature: 0.7,
  max_tokens: 500,
});

const response = completion.choices[0].message.content;
```

##### 4. Format Response

```javascript
// Extract sources that were actually used
const sources = relevantChunks.map(chunk => ({
  articleId: chunk.article.id,
  articleTitle: chunk.article.title,
  authors: chunk.article.authors.map(a => `${a.firstName} ${a.lastName}`),
  year: chunk.article.journal?.year || 'n.d.',
  citation: chunk.article.citation,  // ← Include full citation
  relevanceScore: chunk.similarity
}));

return {
  response: response,
  sources: sources
};
```

**Important**: 
- Ensure your article data includes the `citation` field from your Article table
- Also include the publication year (from the associated journal) so the AI can generate proper in-text citations like (Bauer, 2023)
- When fetching articles, make sure to select/include the `citation` field:
```javascript
const articles = await db.article.findMany({
  where: { id: { in: articleIds } },
  select: {
    id: true,
    title: true,
    citation: true,  // ← Don't forget this!
    authors: true,
    journal: true
  }
});
```

#### Response Format
```json
{
  "response": "string - The AI's answer to the user's question",
  "sources": [
    {
      "articleId": "string",
      "articleTitle": "string", 
      "authors": ["string"],
      "year": "2023",
      "citation": "Bauer, B. (2023). Cross-cultural ministry. Journal of Adventist Mission Studies, 19(2), 45-67.",
      "relevanceScore": 0.85
    }
  ]
}
```

#### Error Handling

**400 Bad Request**: Missing required fields
```json
{
  "error": "Message is required"
}
```

**500 Internal Server Error**: OpenAI or database error
```json
{
  "error": "Failed to process chat request",
  "details": "error message"
}
```

---

### Alternative: Using Embedding Metadata (Optional)

If you prefer to avoid the database join, you can store citation data as metadata in your embeddings:

#### When Creating Embeddings:
```javascript
// Include citation in embedding metadata
await supabase.from('article_embeddings').insert({
  article_id: article.id,
  chunk_text: chunk,
  embedding: embeddingVector,
  metadata: {
    article_title: article.title,
    citation: article.citation,  // ← Store citation in metadata
    authors: article.authors.map(a => ({ firstName: a.firstName, lastName: a.lastName })),
    journal_year: article.journal?.year,
    journal_issue: article.journal?.issueNumber
  }
});
```

#### When Searching:
```javascript
// Metadata comes back automatically with search results
const { data: results } = await supabase.rpc('match_articles', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 5
});

// Use metadata directly (no join needed)
const context = results.map((result, i) => `
Source ${i + 1}:
Article: "${result.metadata.article_title}"
Citation: ${result.metadata.citation}
Content: ${result.chunk_text}
---
`).join('\n');

// Note: To show more unique sources, increase match_count when searching:
const { data: results } = await supabase.rpc('match_articles', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 10  // Increase for more diverse articles
});
```

**Pros:**
- ✅ Faster (no database join)
- ✅ All data in one query

**Cons:**
- ❌ Must re-embed if citations change
- ❌ Metadata can become stale

**Recommendation:** Use the database join approach (as shown in Step 1) unless you have performance requirements that demand embedding metadata.

---

### Complete `/chat` Endpoint Example

Here's a full implementation showing all steps together:

```javascript
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    // 1. Generate embedding for user's question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // 2. Search vector database
    const { data: vectorResults, error: searchError } = await supabase.rpc('match_articles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 10  // Retrieve 10 chunks to get more unique articles
    });
    
    if (searchError) throw searchError;
    
    // 3. Get unique article IDs
    const articleIds = [...new Set(vectorResults.map(r => r.article_id))];
    
    // 4. Fetch complete article data with citations
    const articles = await prisma.article.findMany({
      where: { id: { in: articleIds } },
      select: {
        id: true,
        title: true,
        citation: true,  // ← CRITICAL: Include citation
        authors: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        journal: {
          select: {
            year: true,
            issueNumber: true,
            title: true
          }
        }
      }
    });
    
    // 5. Merge vector results with article data
    const enrichedChunks = vectorResults.map(result => {
      const article = articles.find(a => a.id === result.article_id);
      return {
        content: result.chunk_text || result.content,
        similarity: result.similarity,
        article: article
      };
    });
    
    // 6. Build context with citations
    const context = enrichedChunks.map((chunk, i) => {
      const authorNames = chunk.article.authors
        .map(a => `${a.firstName} ${a.lastName}`)
        .join(', ');
      const year = chunk.article.journal?.year || 'n.d.';
      const citation = chunk.article.citation || 'Citation not available';
      
      return `
Source ${i + 1}:
Article: "${chunk.article.title}"
Authors: ${authorNames}
Year: ${year}
Full Citation: ${citation}
Content: ${chunk.content}
---
      `;
    }).join('\n');
    
    // 7. Build system prompt
    const systemPrompt = `You are an AI research assistant for the Journal of Adventist Mission Studies (JAMS).

Your role is to:
- Help users understand and explore academic articles about mission studies
- Answer questions from a Seventh-day Adventist theological perspective
- Ground responses in Adventist mission theology and biblical principles
- Answer questions based ONLY on the context provided from journal articles
- If the context doesn't contain relevant information, say so honestly
- Be conversational but academically accurate

Context from our journal articles:
${context}

Citation Guidelines:
- For in-text citations, extract (Author, Year) from the "Full Citation" field
- When asked for complete citations, provide the EXACT "Full Citation" as given
- Do not make up citations - use only the "Full Citation" provided
- Use markdown formatting for better readability (bold, italic, lists, blockquotes)

Respond from a Seventh-day Adventist perspective.`;
    
    // 8. Build messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),  // Last 10 messages for context
      { role: 'user', content: message }
    ];
    
    // 9. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // or 'gpt-3.5-turbo'
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // 10. Format sources for response
    const sources = enrichedChunks.map(chunk => ({
      articleId: chunk.article.id,
      articleTitle: chunk.article.title,
      authors: chunk.article.authors.map(a => `${a.firstName} ${a.lastName}`),
      year: chunk.article.journal?.year || 'n.d.',
      citation: chunk.article.citation,
      relevanceScore: chunk.similarity
    }));
    
    // 11. Return response
    res.json({
      response: aiResponse,
      sources: sources
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});
```

**Key Points:**
- ✅ Fetches `citation` field from Article table (line 44)
- ✅ Includes citation in context sent to OpenAI (line 73)
- ✅ Instructs AI to use citations properly (lines 95-97)
- ✅ Returns citations in response (line 121)

---

## Frontend Implementation

### Files Created/Modified

#### 1. **screens/Chat.jsx** (NEW)
A complete chat interface with:
- Message history display (user vs assistant bubbles)
- Real-time message input
- Loading indicators while AI responds
- Source citations with clickable links to articles
- Clear chat functionality
- Auto-scrolling to latest messages
- Keyboard-aware layout

**Key Features:**
- Local-only message storage (cleared on app restart)
- Sends last 10 messages as context for follow-up questions
- Navigates to article details when sources are clicked
- Beautiful UI matching your app's design system
- **Markdown formatting** for AI responses (bold, italic, lists, code, quotes, etc.)

#### 2. **navigation/BottomTabNavigation.jsx** (MODIFIED)
Added new "Chat" tab with chatbubbles icon between Search and Videos.

**Tab Order:**
1. Home 🏠
2. Search 🔍
3. **Chat 💬** (NEW)
4. Videos 📹
5. Profile 👤

---

## Testing Your Implementation

### Step 1: Implement Backend
1. Create the `/chat` endpoint following the specification above
2. Test with curl or Postman:

```bash
curl -X POST https://jams-journal-backend.up.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key challenges in cross-cultural ministry?",
    "conversationHistory": []
  }'
```

**Expected Response:**
```json
{
  "response": "According to several articles in JAMS, cross-cultural ministry faces challenges including...",
  "sources": [
    {
      "articleId": "123",
      "articleTitle": "Cross-Cultural Communication in Mission",
      "authors": ["Bruce Bauer"],
      "relevanceScore": 0.89
    }
  ]
}
```

### Step 2: Test Frontend
1. Restart your Expo app: `npx expo start`
2. Navigate to the new Chat tab (3rd icon in bottom navigation)
3. Try asking questions:
   - "What is contextualization?"
   - "Tell me about worldview transformation"
   - "What did Bruce Bauer write about?"
4. Verify:
   - Messages appear correctly (user on right, AI on left)
   - Sources are clickable and navigate to articles
   - Loading indicator shows while waiting
   - Follow-up questions maintain context

---

## Example Conversations

### Example 1: Simple Q&A with In-text Citations
**User**: "What is contextualization?"  
**AI**: 
```markdown
From a **Seventh-day Adventist perspective**, contextualization is the process of communicating the Three Angels' Messages and biblical truth in culturally relevant ways (Tompkins, 2023).

**Key Principles:**
- Understanding local worldviews through biblical lenses
- Adapting communication methods while maintaining doctrinal integrity (Tompkins, 2023)
- Respecting cultural values that align with Scripture
- Balancing cultural relevance with prophetic distinctiveness

As Tompkins (2023) explains:
> "Contextualization is not about changing the message, but about communicating it in culturally relevant ways that honor both Scripture and the Great Commission."

This aligns with Ellen White's counsel on adapting methods while preserving core truths.
```
**Sources**: [Contextual Theology in Mission, Andrew Tompkins, 2023] → clickable

### Example 2: Follow-up Questions with Citations
**User**: "What are the key challenges in cross-cultural ministry?"  
**AI**: 
```markdown
Cross-cultural ministry faces several key challenges according to JAMS research:

**Major Challenges:**
- Language and communication barriers (Bauer, 2020)
- Worldview differences that affect theological understanding (Sanou, 2021)
- Cultural assumptions about time, relationships, and authority (Tompkins & Bauer, 2019)
- Balancing contextualization with biblical fidelity (Duffis, 2023)

Bauer (2020) notes that effective cross-cultural ministry requires both cultural sensitivity and theological clarity.
```

**User**: "Can you tell me more about worldview differences?"  
**AI**: 
```markdown
Sanou (2021) provides an in-depth analysis of worldview differences in mission contexts:

> "Worldview shapes how people understand reality, spirituality, and Scripture itself. Missionaries must recognize these deep differences to communicate effectively."

Key aspects include:
- **Epistemology**: How people know what they know (Sanou, 2021)
- **Cosmology**: Understanding of the spiritual realm
- **Social structures**: Family, authority, and community dynamics

This builds on earlier work by Bauer (2020), who emphasized the importance of worldview transformation rather than simple behavioral change.
```

### Example 3: No Relevant Context
**User**: "What's the weather like?"  
**AI**: "I'm sorry, I can only answer questions about mission studies and the articles in the JAMS journal. How can I help you explore our research?"

---

## Markdown Support

The chat interface now supports full markdown formatting in AI responses! This makes responses more readable and organized.

### Supported Markdown Features

| Feature | Syntax | Rendered As |
|---------|--------|-------------|
| **Bold** | `**text**` or `__text__` | **Bold text** |
| *Italic* | `*text*` or `_text_` | *Italic text* |
| Headings | `# H1`, `## H2`, `### H3` | Large, medium, small headings |
| Lists | `- item` or `1. item` | Bullet or numbered lists |
| Blockquotes | `> quote` | Indented quote with blue border |
| Inline code | `` `code` `` | `code` with gray background |
| Code blocks | ` ```code``` ` | Multi-line code blocks |
| Links | `[text](url)` | Blue underlined clickable links |

### Best Practices for Backend

When generating responses, encourage the AI to use markdown for:
- **Emphasis**: Use bold for key concepts and terms
- **Citations**: Use APA in-text format (Author, Year) throughout the response
- **Article titles**: Use italic when mentioning full article titles
- **Lists**: Break down complex information into bullet points
- **Quotes**: Use blockquotes for direct excerpts from articles
- **Structure**: Use headings to organize longer responses

### Citation Examples in Practice

The AI should naturally integrate citations like:
- "Cross-cultural communication requires cultural sensitivity (Bauer, 2020)."
- "As Sanou (2021) argues, worldview differences are fundamental..."
- "Multiple studies have explored this topic (Tompkins, 2019; Bauer, 2020; Duffis, 2023)."
- "Bauer and Sanou (2022) provide a comprehensive framework..."

### Example Backend Prompt Addition

```javascript
const systemPrompt = `...
Important Context:
- You represent the Journal of Adventist Mission Studies (JAMS)
- Respond from a Seventh-day Adventist theological perspective
- Ground answers in Adventist mission theology and biblical principles
- Respect the theological foundations of Adventist mission work

Citation Format:
- Use APA-style in-text citations: (Author, Year)
- For single author: (Bauer, 2023)
- For two authors: (Sanou & Duffis, 2022)
- For three+ authors: (Tompkins et al., 2021)
- When mentioning in text: "As Bauer (2023) argues..."
- Always cite when referencing specific claims or concepts

When formatting your response, use markdown:
- **Bold** for key terms and concepts
- *Italic* for article titles and emphasis  
- Bullet points for lists
- > Blockquotes for direct article excerpts
- \`backticks\` for technical terms
...`;
```

---

## Configuration Options

### Adjust Response Length
In backend, modify `max_tokens`:
- Short answers: `max_tokens: 300`
- Detailed answers: `max_tokens: 800`

### Adjust Creativity
In backend, modify `temperature`:
- More focused: `temperature: 0.3`
- More creative: `temperature: 0.9`

### Adjust Number of Sources Displayed
In backend, modify `match_count` in vector search:
```javascript
// Fewer sources (faster, more focused)
match_count: 3

// Balanced (recommended)
match_count: 10

// More sources (comprehensive, but more tokens)
match_count: 20
```

**Important:** Higher `match_count` means:
- ✅ More diverse article sources
- ✅ More comprehensive answers
- ❌ More OpenAI tokens used (higher cost)
- ❌ Longer processing time

**Tip:** If you want exactly N unique articles as sources, retrieve `match_count: N * 3` to account for duplicate articles across chunks.

### Frontend Customization
In `screens/Chat.jsx`:
- Line 7: Change initial greeting message
- Line 57: Adjust conversation history length (currently 10)
- Line 234-280: Customize colors and styling

---

## Tips for Better Results

### Backend:
1. **Quality embeddings**: Ensure article chunks are properly segmented (500-1000 characters)
2. **Metadata**: Include rich metadata (authors, year, keywords) in context
3. **Prompt engineering**: Iterate on the system prompt for better responses
4. **Rate limiting**: Consider rate limiting to manage OpenAI costs

### Frontend:
1. **Error messages**: Handle network failures gracefully
2. **Empty states**: Provide example questions users can ask
3. **Loading states**: Show typing indicators for better UX
4. **Persistence**: Consider adding chat history export/save feature later

---

## Cost Considerations

### OpenAI API Costs (approximate):
- **GPT-3.5-turbo**: ~$0.002 per request
- **GPT-4**: ~$0.03 per request

**Recommendation**: Start with GPT-3.5-turbo for development and testing, upgrade to GPT-4 if you need better quality responses.

### Monitoring:
- Track daily API usage
- Set up OpenAI usage alerts
- Consider implementing caching for common questions

---

## Future Enhancements

### Phase 2 (Optional):
1. **Save conversations**: Store chat history in Supabase
2. **Share chats**: Allow users to share interesting conversations
3. **Suggested questions**: Show relevant follow-up questions
4. **Voice input**: Add speech-to-text for questions
5. **Export**: Allow users to export chat as PDF/email
6. **Feedback**: Let users rate responses (helpful/not helpful)
7. **Admin analytics**: Track popular questions to improve content

---

## Troubleshooting

### Citations Not Appearing in AI Responses 🔍

**Problem:** AI doesn't use citations from your database, or uses incorrect citations.

**Root Causes & Solutions:**

#### 1. Citation field not fetched from database ❌
```javascript
// BAD - citation field missing
const articles = await prisma.article.findMany({
  where: { id: { in: articleIds } },
  select: {
    id: true,
    title: true,
    authors: true
    // Missing: citation field!
  }
});
```

**Fix:** Include `citation` in select:
```javascript
// GOOD
const articles = await prisma.article.findMany({
  where: { id: { in: articleIds } },
  select: {
    id: true,
    title: true,
    citation: true,  // ← Add this
    authors: true,
    journal: true
  }
});
```

#### 2. Citation not included in context sent to OpenAI ❌
```javascript
// BAD - citation not in prompt
const context = `
Article: "${article.title}"
Authors: ${authors}
Content: ${chunk}
`;
```

**Fix:** Include citation in context:
```javascript
// GOOD
const context = `
Article: "${article.title}"
Full Citation: ${article.citation}  // ← Add this
Authors: ${authors}
Content: ${chunk}
`;
```

#### 3. System prompt doesn't tell AI to use citations ❌
```javascript
// BAD - no instruction to use citations
const systemPrompt = `Answer questions about articles...`;
```

**Fix:** Add citation instructions:
```javascript
// GOOD
const systemPrompt = `...
When citing sources:
- Use the "Full Citation" field provided for each source
- For in-text citations, extract (Author, Year) from the Full Citation
- Do not make up citations - use only what is provided
...`;
```

#### 4. Citation field is null/empty in database 📊
**Check:** Log the citation data:
```javascript
console.log('Articles with citations:', articles.map(a => ({
  id: a.id,
  citation: a.citation
})));
```

If citations are `null`, you need to populate them in your database first.

#### 5. Debugging Checklist ✅
Run through these checks in order:

1. **Database Check:**
```sql
SELECT id, title, citation FROM "Article" LIMIT 5;
```
Are citations populated?

2. **Backend Fetch Check:**
```javascript
console.log('Fetched articles:', articles);
```
Does `citation` field exist in the data?

3. **Context Check:**
```javascript
console.log('Context sent to OpenAI:', context.substring(0, 500));
```
Does the context include "Full Citation: ..."?

4. **OpenAI Response Check:**
```javascript
console.log('AI response:', aiResponse);
```
Does the AI mention citations?

---

### "Failed to get response from AI"
- ✅ Check backend endpoint is deployed and accessible
- ✅ Verify OpenAI API key is configured
- ✅ Check backend logs for errors

### Only Seeing 2-3 Sources (Want More) 📚

**Problem:** Chat shows only 2-3 sources, but you want to display more.

**Causes & Solutions:**

#### Cause 1: Backend `match_count` is too low
Your vector search is limiting results:
```javascript
// Current (returns fewer chunks)
match_count: 5
```

**Fix:** Increase the limit:
```javascript
// Better (returns more chunks for diverse articles)
match_count: 10  // or 15, 20
```

#### Cause 2: Multiple chunks from same article
If 5 chunks all come from 2 articles, you'll only see 2 sources.

**Fix:** After getting article IDs, you can either:
1. Increase `match_count` (recommended)
2. Group chunks by article and take top N articles
3. Diversify by taking max 1-2 chunks per article

**Example - Ensure Minimum Unique Articles:**
```javascript
// Get more chunks than needed
const { data: vectorResults } = await supabase.rpc('match_articles', {
  query_embedding: queryEmbedding,
  match_count: 20  // Get 20 chunks
});

// Take max 2 chunks per article to diversify
const articleChunkCount = {};
const diverseResults = vectorResults.filter(result => {
  const count = articleChunkCount[result.article_id] || 0;
  if (count < 2) {
    articleChunkCount[result.article_id] = count + 1;
    return true;
  }
  return false;
}).slice(0, 10);  // Limit to top 10 diverse chunks
```

---

### Sources not appearing at all
- ✅ Ensure backend returns `sources` array
- ✅ Check article IDs are valid
- ✅ Verify `citation` field is included in sources object

### Navigation to article fails
- ✅ Verify article ID format matches existing navigation
- ✅ Check Article screen can handle ID-only navigation

### Chat looks broken
- ✅ Verify fonts are loaded in App.js
- ✅ Check SafeAreaView is working properly
- ✅ Test on both iOS and Android

---

## Support

For questions or issues:
1. Check backend logs for API errors
2. Use React Native debugger for frontend issues
3. Test API endpoint independently with curl/Postman
4. Verify OpenAI API key and credits

---

## Summary

You now have:
✅ Complete backend specification for `/chat` endpoint  
✅ Beautiful chat interface in your React Native app  
✅ Integration with existing navigation and article system  
✅ Source citations with clickable links  
✅ Context-aware follow-up questions  
✅ Local message storage (resets on app restart)  
✅ **Full markdown formatting support** (bold, italic, lists, quotes, code, etc.)

---

## 📋 Documentation Update Summary

This documentation now includes **explicit guidance** on how to include citation data in your chat responses:

### What Changed:
1. ✅ **Clear Data Flow Diagram** - Shows exactly how citations flow from database to AI
2. ✅ **Step-by-Step Context Retrieval** - Explicit database join to fetch `citation` field
3. ✅ **Complete `/chat` Endpoint Example** - 150+ line working implementation
4. ✅ **Citation Troubleshooting Section** - Debug guide for when citations don't appear
5. ✅ **Alternative Metadata Approach** - Optional method using embedding metadata

### Key Requirement:
**Your backend MUST:**
- Fetch the `citation` field from the Article table
- Include it in the context sent to OpenAI as "Full Citation: ..."
- Instruct the AI to use citations in the system prompt

### Recommended Approach:
Use **database joins** (not embedding metadata) to get fresh citation data:
```javascript
// 1. Vector search returns article_ids
// 2. Join with Article table to get citation
// 3. Include citation in context
// 4. AI uses citation from context
```

**Next Step**: Implement the backend `/chat` endpoint following the complete example (starting at line 308) and start chatting! 🚀

