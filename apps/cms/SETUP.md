# Directus CMS Setup

## Initial Setup

1. Run `docker compose up cms -d`
2. Access http://localhost:8055
3. Login with: `admin@example.com` / `admin123` (from docker-compose.yml)
4. Create collections as defined below

## Collections

### `cms_articles`
- `title` (string, required)
- `slug` (string, unique, required)
- `summary` (text)
- `content` (text/markdown)
- `cover_image` (image)
- `category` (string)
- `tags` (json)
- `author` (string)
- `published_at` (datetime)
- `status` (string: draft/published/archived)

### `cms_faq`
- `question` (string, required)
- `answer` (text, required)
- `category` (string)
- `sort` (integer)

### `cms_pages`
- `title` (string, required)
- `slug` (string, unique, required)
- `content` (text)
- `meta` (json — SEO metadata)

### `cms_homepage_sections`
- `section_type` (string: hero/services/why-us/stats/testimonials/cta/faq)
- `title` (string)
- `content` (text)
- `image` (image)
- `sort_order` (integer)
- `is_active` (boolean)

## Roles

- `content_manager` — CRUD articles, FAQ, pages
- `admin` — Full access to CMS collections

## API Access

Directus data is consumed by `apps/api` (Hono) via read-only access.
Frontend never queries Directus directly for business data.
