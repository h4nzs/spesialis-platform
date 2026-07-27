# auth.md

You are an agent. This service supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation.

## Base URL

```
https://ahlipanggilan.id/api/v1
```

## Authentication Methods

### 1. Bearer Token Authentication

Most API endpoints require a JWT bearer token sent via the `Authorization` header:

```
Authorization: Bearer <token>
```

**Token Lifetime:** 2 hours
**Refresh Token Lifetime:** 7 days (httpOnly cookie)

### 2. Cookie-Based Authentication (Browser Agents)

For browser-based agents, authentication is handled via httpOnly cookies:

- `token`: JWT access token (httpOnly, SameSite=Strict, 2-hour expiry)
- `refreshToken`: Refresh token (httpOnly, SameSite=Strict, path=/api/v1/auth, 7-day expiry)

### 3. Public Endpoints (No Auth Required)

The following endpoints are publicly accessible:

| Endpoint                                       | Description             |
| ---------------------------------------------- | ----------------------- |
| `GET /api/v1/services`                         | List available services |
| `GET /api/v1/services/:slug`                   | Get service details     |
| `GET /api/v1/service-categories`               | List service categories |
| `GET /api/v1/public/coverage-areas`            | List coverage areas     |
| `GET /api/v1/cms/articles`                     | List published articles |
| `GET /api/v1/cms/articles/:slug`               | Get article details     |
| `GET /api/v1/bookings/tracking/:bookingNumber` | Track a booking         |
| `GET /api/v1/reviews`                          | List public reviews     |
| `GET /api/v1/health`                           | Health check            |
| `GET /api/v1/sitemap-settings`                 | Sitemap configuration   |
| `POST /api/v1/auth/login`                      | User login              |
| `POST /api/v1/auth/register`                   | User registration       |
| `POST /api/v1/bookings`                        | Create a guest booking  |
| `POST /api/v1/partners`                        | Partner registration    |

## Authentication Flow

### For API Agents (Bearer Token)

```
1. POST /api/v1/auth/login
   Body: { "email": "...", "password": "..." }
   Response: { "data": { "token": "jwt...", "refreshToken": "..." } }

2. Use the token in subsequent requests:
   GET /api/v1/services
   Authorization: Bearer <token>

3. When token expires (401), refresh:
   POST /api/v1/auth/refresh
   Body: { "refreshToken": "..." }
   Response: { "data": { "token": "new-jwt...", "refreshToken": "new-refresh..." } }
```

### For Browser-Based Agents

Authentication is handled automatically via httpOnly cookies set by the server.
No manual token management is needed — cookies are sent with every request.

## Registration

To create a new account:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "agent@example.com",
  "password": "secure-password",
  "name": "AI Agent",
  "role": "customer"
}
```

Roles available: `customer`, `partner`, `corporate`

## Token Revocation

To revoke an active access token:

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

## API Catalog

For full API discovery, see the [API Catalog](/.well-known/api-catalog) which provides a machine-readable linkset of all available endpoints, their relations, and documentation references.

## Rate Limiting

- General: 30 requests/second per IP
- API: 100 requests/second per IP
- Auth endpoints: 10 requests/second per IP

## Additional Resources

- [Site Overview](/llms.txt) — AI-readable platform overview
- [Full Documentation](/llms-full.txt) — Complete platform documentation
- [Sitemap](/sitemap.xml) — XML sitemap
- [MCP Server Card](/.well-known/mcp/server-card.json) — MCP discovery metadata
- [Agent Skills Index](/.well-known/agent-skills/index.json) — Available agent skills
