# API Reference

Rather than listing all endpoints in a text document that quickly becomes out of date, **Sports Monitor** ships an interactive **Swagger UI** to explore and test the API directly from your browser.

## Accessing the Swagger UI

1. Start the local backend server (see the [Getting Started guide](GETTING_STARTED.md)).
2. Navigate to: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

---

## Endpoint Groups

### Authentication (`/api/auth`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a new user account |
| POST | `/api/auth/login` | No | Obtain `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | No | Exchange refresh token for new access token |
| POST | `/api/auth/logout` | Yes | Invalidate the current session |

### Sports (`/api/sports`)

All sports routes read exclusively from **ElastiCache Redis**, which is seeded every 5 minutes by the `ingestSports` CRON Lambda. If the cache is empty (e.g. first CRON hasn't run yet), endpoints return `[]` gracefully.

| Method | Path | Cache TTL | Description |
|---|---|---|---|
| GET | `/api/sports/live` | 30 s | All currently active live events |
| GET | `/api/sports/by-country?country=<name>` | 60 s | Events filtered by country name |
| GET | `/api/sports/by-sport/:sport` | 60 s | Events filtered by sport type (e.g. `football`, `cricket`) |

### Stats (`/api/stats`)

| Method | Path | Cache TTL | Description |
|---|---|---|---|
| GET | `/api/stats/:countryCode` | 300 s | Total events, active sports, and recent matches for a country |
| GET | `/api/stats/heatmap/global` | 300 s | Data array for the global activity heatmap |

### AI (`/api/ai`)

AI endpoints call **AWS Bedrock (Claude 3 Sonnet)**. They are rate-limited to **10 requests per 15 minutes per IP**. The service is **stateless** — multi-turn conversations require the caller to supply prior message history in the request body.

| Method | Path | Description |
|---|---|---|
| POST | `/api/ai/chat` | Send a message; optionally pass `context` and `history` |
| POST | `/api/ai/summarize-match` | Generate a short commentary for a match object |
| GET | `/api/ai/prediction/:matchId` | Retrieve an AI prediction (Amazon Forecast stub) |

### User (`/api/user`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/user/profile` | Yes | Get the authenticated user's profile |
| PUT | `/api/user/profile` | Yes | Update profile fields |
| GET | `/api/user/favorites` | Yes | List favourite teams/sports |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{ status, services: { database, redis }, metrics: { memory } }` |

---

## Testing Authenticated Endpoints in Swagger

1. Call `POST /api/auth/register` or `POST /api/auth/login` and copy the `accessToken` from the response.
2. Click the green **Authorize** button at the top of the Swagger page.
3. Paste your token (it begins with `eyJ`) and click **Authorize**.

All subsequent requests in the same Swagger session will include the Bearer header automatically.

---

## Response Caching Headers

Cached responses include a `Cache-Control: public, max-age=<ttl>` header so browsers and CDN edges can honour the same TTL as Redis.
