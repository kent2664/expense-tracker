# Sprint 1 Plan

**Project:** Expense Tracker  
**Sprint Goal:** Core CRUD with LocalStorage + basic responsive UI

## Sprint Dates
Start: YYYY‑MM‑DD  
End: YYYY‑MM‑DD

## Roles (Rotate each sprint)
- Product Owner: ___
- Scrum Master: Tiana
- Developers: Thales, Kenta

## Selected Stories (from Product Backlog)
| ID | Story | Priority | Estimate | Acceptance Criteria (summary) |
|---|---|---|---|---|
| 1 | As a user, I want to add an expense (amount, category, date, description). | High | 3 | Item appears in list and persists on reload. |
| 2 | As a user, I want to delete an expense. | High | 2 | Deleting removes item and updates totals. |
| 3 | As a user, I want to see a list of expenses. | High | 2 | Renders latest first; basic responsive layout. |

## Task Breakdown
| Story ID | Task | Owner | Estimate | Status (To‑Do/In‑Progress/Review/Done) |
|---|---|---|---|---|
| 1 | Build expense form (HTML/CSS) |  |  | To‑Do |
| 1 | Hook form submit → JS handler |  |  | To‑Do |
| 1 | Save expense to LocalStorage |  |  | To‑Do |
| 3 | Render list from LocalStorage |  |  | To‑Do |
| 2 | Implement delete action (UI + JS) |  |  | To‑Do |
| 3 | Basic responsive styling (mobile first) |  |  | To‑Do |

## Definition of Done (reference)
See `../definition_of_done.md`.

## Risks / Assumptions
- Risk: Inconsistent LocalStorage schema → **Mitigation:** define a single `expenses` array shape up front.
- Risk: Time underestimated for UI polish → **Mitigation:** keep styles minimal this sprint.
