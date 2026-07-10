# Docker Infrastructure

## Services

| Service  | Image        | Description             |
| -------- | ------------ | ----------------------- |
| nginx    | nginx:alpine | Reverse Proxy           |
| postgres | postgres:18  | Database                |
| redis    | redis:alpine | Cache & Queue (Future)  |
| mailpit  | mailpit      | Email Development (Dev) |
| api      | -            | Hono API                |
| web      | -            | Astro Frontend          |

---

## Network

- internal
- external

---

## Volume

- postgres
- uploads
- logs

---

## Command

```bash
docker compose up -d
```

---

## Environment

Lihat [deployment.md](../../docs/architecture/deployment.md) untuk daftar environment variable.

---

## Referensi

Deployment: [docs/architecture/deployment.md](../../docs/architecture/deployment.md)
