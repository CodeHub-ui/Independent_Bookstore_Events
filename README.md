# Independent Bookstore Events Page

## Description
A lightweight web page that replaces paper registers and Excel sheets for an independent bookstore. Staff can view, search and add events from a desktop or tablet, with no build tools or server.

## Features
- Responsive UI (3 / 2 / 1 columns)
- Real-time Search (title, author, category)
- Dynamic Event Cards
- Add Event Form
- Client-side Validation
- Empty State
- Skeleton Loading (1.5s simulated slow connection)
- XSS Protection via `sanitizeInput()`
- Accessibility Support
- Analytics Simulation

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript

## Folder Structure
```text
independent-bookstore-events/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run
No installation needed. Open `index.html` in any modern browser.

## Validation Rules
| Field | Rule |
|---|---|
| Title | Required |
| Author | Required |
| Date | Required |
| Time | Required |
| Category | Must be one of the listed categories |
| Seats | Whole number, at least 1 |
| Description | Required |

Invalid fields get a red border and an inline message announced to screen readers. Focus moves to the first invalid field, and submission is blocked until all rules pass. Text is trimmed and escaped (`& < > " '`) before storage.

## Accessibility
Semantic landmarks (`header`, `main`, `section`, `article`, `footer`, `form`), labels tied to inputs, ARIA labels and `aria-describedby`/`aria-invalid` for errors, live regions for results and notifications, full keyboard navigation with a skip link, visible focus outlines, and a logical heading hierarchy.


## Future Improvements
- Local Storage persistence
- Edit/Delete Events
- Excel Import/Export
- Offline PWA support
- Backend API integration
