# App — the frame around everything

| File | What it is |
|---|---|
| `main.ts` | Starts the app |
| `App.tsx` | Sign-in (Clerk): shows the login page or the workspace |
| `LoginPage.tsx` | The login page: one "Continue with Google" button that signs people in or up |
| `LeadsApp.tsx` | The workspace: which page is open, the data every page shows, and the save / delete handlers. Each page's layout comes from its feature folder (`src/features/…/screen/`) |
| `TopNav.tsx` | The top bar: Leads, Quotation, Quotation Reports, Settings, and the user menu |
| `style.css`, `leads.css` | Global styles |

Possible later tidy-up: the data and handlers each page uses could move next to that page, so `LeadsApp.tsx` keeps only page switching.
