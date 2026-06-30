# docs/development/branching-strategy.md

# Branching Strategy

---

main

Production.

---

develop

Development.

---

feature/*

New Feature.

---

bugfix/*

Bug.

---

hotfix/*

Production Emergency.

---

release/*

Release Preparation.

---

docs/*

Documentation.

---

refactor/*

Internal Improvement.

---

# Rules

Branch dibuat dari develop.

Merge kembali ke develop.

Release Branch merge ke main.

Hotfix merge ke:

main

dan

develop.

---

# Lifetime

Feature Branch

↓

Delete setelah Merge.

---

Naming

feature/customer-dashboard

feature/payment

feature/corporate
