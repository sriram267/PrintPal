# App — the frame around everything

Sign-in, the top bar and menu, switching between pages, the Pal notch at the top, and global styles.
No feature logic lives here: each page comes from its folder in `src/features/`.

Until the code is moved here, it still lives in: `src/main.ts`, `src/App.tsx`, `src/style.css`,
`src/modules/auth/LoginPage.tsx`, and the top bar / page switching parts of `src/modules/leads/LeadsApp.tsx`.
