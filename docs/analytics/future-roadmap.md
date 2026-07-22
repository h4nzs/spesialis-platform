# Future Roadmap

## Phase 20: Analytics Contract

- Single source of truth for all events
- Auto-generate TypeScript typing from registry
- CI validation for event definitions
- Bundle validation: fail build on unregistered events

## Phase 21: CI/CD Integration

- GitHub Action to validate event usage
- Prevent magic strings in analytics calls
- Ensure all events are registered before merge

## Phase 22: Final Audit Tooling

- CLI tool to scan codebase for analytics usage
- Detect dead/unused events
- Detect unregistered properties
- Bundle impact report

## Provider Expansion

| Provider                    | Status     | Notes                      |
| --------------------------- | ---------- | -------------------------- |
| Plausible CE                | ✅ Active  | Self-hosted, production    |
| PostHog                     | 📋 Planned | Self-hosted or cloud       |
| Cloudflare Browser Insights | 📋 Planned | RUM data                   |
| Google Analytics 4          | 🔮 Future  | For clients who require it |
| OpenTelemetry               | 🔮 Future  | For internal observability |
| Custom Event Collector      | 🔮 Future  | Internal data warehouse    |

## Feature Roadmap

### Q3 2026

- A/B Testing framework (`experiment` category)
- Funnel analysis dashboard
- Goal conversion tracking UI
- Session replay integration

### Q4 2026

- Executive dashboard with real-time KPIs
- Automated anomaly detection
- Custom report builder
- Data export to CSV/JSON

### Q1 2027

- Machine learning predictions
- Churn prediction models
- Automated funnel optimization suggestions
- Multi-touch attribution

### Q2 2027+

- Internal data warehouse
- BI tool integration (Metabase, Superset)
- Real-time event streaming (Kafka/Redpanda)
- Customer Data Platform (CDP) integration

## Technical Improvements

| Improvement                             | Priority | Impact                    |
| --------------------------------------- | -------- | ------------------------- |
| `dispatchBatchReliable()` test coverage | Medium   | Test gap                  |
| Timeout via `Promise.race` tests        | Medium   | Reliability verification  |
| E2E tests with Playwright               | High     | Browser feature coverage  |
| Performance benchmarks                  | Medium   | Bundle size budget        |
| Provider health monitoring              | Low      | Operational visibility    |
| Event schema versioning                 | Medium   | Long-term maintainability |
