# Sprint 2 Plan

**Project:** Expense Tracker  
**Sprint Goal:**basic responsive UI

## Sprint Dates
Start: 2025‑10‑14  
End: 2025‑10‑17

## Roles (Rotate each sprint)
- Product Owner: Thales
- Scrum Master: Kenta
- Developers: Thales,Tiana, Kenta

## Selected Stories (from Product Backlog)
| ID | Story | Priority | Estimate | Acceptance Criteria (summary) |
|---|---|---|---|---|
| 1 | As a user, I want to add an expense (amount, category, date, description). | High | 3 | Item appears in list and persists on reload. |
| 2 | As a user, I want to delete an expense. | High | 2 | Deleting removes item and updates totals. |
| 3 | As a user, I want to edit an expense. | High | 2 | Editing targets item and updates totals. |
| 4 | As a user, I want to edit an Budget. | High | 2 | Editing targets item and updates totals. |
| 5 | As a user, I want to see a list of expenses. | High | 2 | Renders latest first; basic responsive layout. |

## Task Breakdown
| Story ID | Task | Owner | Estimate | Status (To‑Do/In‑Progress/Review/Done) |
|---|---|---|---|---|
| 1 | Build expense form (HTML/CSS) |  |  | Done |
| 4 | Build budget form (HTML/CSS) |  |  | Done |
| 1 | Hook form submit → JS handler |  |  | Done |
| 1 | Save expense to LocalStorage |  |  | Done |
| 4 | Save budget to LocalStorage |  |  | Done |
| 3 | Render list from LocalStorage |  |  | Done |
| 4 | Render the budget amount from LocalStorage |  |  | Done |
| 2 | Implement delete action - expense (UI + JS) |  |  | Done |
| 4 | Implement edit action - budget (UI + JS) |  |  | Done |
| 5 | Basic responsive styling (mobile first) |  |  | Done |

## Definition of Done (reference)
See `../definition_of_done.md`.

## Risks / Assumptions
- Risk: Inconsistent LocalStorage schema → **Mitigation:** define a single `expenses` array shape up front.
- Risk: Time underestimated for UI polish → **Mitigation:** keep styles minimal this sprint.
