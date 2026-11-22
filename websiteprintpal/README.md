# PrintPal website

The marketing site for PrintPal: quoting software for sign shops and large-format printers.
React 18 + TypeScript + Vite, deployed to Cloudflare Pages.

## Run it

```bash
npm install
cp .env.example .env   # then fill in the two values below
npm run dev            # http://localhost:5180
```

## Environment

| Variable | What it is |
|---|---|
| `VITE_APP_URL` | The PrintPal app. Every sign-up / sign-in button goes here. |

## Signing up: Google only

There is no waitlist. The website doesn't load Clerk at all: every "Get started" / "Continue with Google" button is a
link to `<app>/?auth=google` (`src/lib/links.ts`, `src/components/GoogleButton.tsx`). The app's login page sees
`?auth=google` and goes straight to Google. The same button signs new people up and existing people in, and the session is
created on the app's own domain, so people land inside PrintPal signed in. "Sign in" links to the app's login page,
which is a single "Continue with Google" button.

Clerk (sign-up mode **Open**, Google as the only way in) is the only place people are stored. Neon holds only each shop's
business data, keyed by Clerk user id (created on first login by the app's `/api/auth/sync-user`).

## Deploy (Cloudflare Pages, project `printpal-web`)

```bash
npm run build
npx wrangler pages deploy dist --project-name printpal-web --branch main
```

Needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment (not in this repo).

## Machines

The CNC router and wide-format printer are isometric SVGs generated with the Anatomy kit (`vendor/anatomy`, MIT):

```bash
node scripts/machines/build.mjs   # writes src/components/Scene/machines.generated.ts
```
