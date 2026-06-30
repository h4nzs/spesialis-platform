# Deployment

Project: Specialist Platform

Version: 1.0

---

# Environment

Development

Staging

Production

---

# Infrastructure

Docker Compose

Nginx

PostgreSQL

Web (Astro)

API (Hono)

CMS (Directus)

Redis (Cache — Future)

---

# Reverse Proxy

Nginx.

Route.

/

↓

Web (Astro)

/api/*

↓

API (Hono)

/cms/*

↓

CMS (Directus)

---

# SSL

Let's Encrypt.

HTTPS wajib.

---

# Domain

www.domain.com

↓

Web (Astro)

api.domain.com

↓

API (Hono)

cms.domain.com

↓

CMS (Directus)

---

# Environment Variables

APP_URL

CMS_URL

DATABASE_URL

JWT_SECRET

R2_ENDPOINT

R2_BUCKET

R2_ACCESS_KEY

R2_SECRET_KEY

SMTP_HOST

SMTP_USER

SMTP_PASSWORD

---

# Health Check

/health

---

# Logging

Application Log

Nginx Log

Database Log

Docker Log

---

# Monitoring

Future.

Grafana

Prometheus

Uptime Kuma

---

# Backup

Database.

Daily.

Media.

Weekly.

Configuration.

Git Repository.

---

# Disaster Recovery

Restore Database.

Restore Media.

Restore Environment.

Restart Containers.

---

# CI/CD

GitHub

↓

GitHub Actions

↓

Docker Build

↓

Deploy

---

# Production Checklist

HTTPS

Firewall

Backup

Monitoring

Secrets

Rate Limit

Caching

Compression

Security Headers

---

# Future

Kubernetes

Multi Server

Load Balancer

CDN
