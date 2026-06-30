# docs/development/git-workflow.md

# Git Workflow

Project: Specialist Platform

Version: 1.0

---

# Branch Strategy

main

Production Branch.

Tidak boleh commit langsung.

---

develop

Integration Branch.

Semua feature masuk ke sini.

---

feature/<name>

Contoh.

feature/booking-form

feature/order-management

feature/auth

---

bugfix/<name>

Contoh.

bugfix/login

---

hotfix/<name>

Production Fix.

---

refactor/<name>

Internal Improvement.

---

docs/<name>

Documentation.

---

# Workflow

main

↓

develop

↓

feature

↓

Pull Request

↓

Code Review

↓

Merge develop

↓

Release

↓

main

---

# Pull Request Checklist

- Build Success
- Lint Success
- Typecheck Success
- Documentation Updated
- No Console Log
- No any
- Tested

---

# Merge Rules

Minimal 1 Approval.

CI wajib hijau.

Tidak boleh Force Push ke main.

---

# Commit Convention

feat:

fix:

refactor:

docs:

style:

perf:

test:

build:

ci:

chore:

revert:

---

# Example

feat(booking): add booking form

fix(auth): refresh token bug

docs(api): update authentication endpoint

---

# Tagging

v1.0.0

v1.1.0

v2.0.0

Semantic Versioning.
