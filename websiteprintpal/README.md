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
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk **publishable** key (`pk_...`). Public by design. Never put the secret key (`sk_...`) in this project. |
| `VITE_APP_URL` | The PrintPal app. "Sign in" and Clerk's "Already have access? Sign in" go here. |

## One system for people: Clerk

Clerk is the only place people are stored: waitlist entries, invitations, accounts, sessions. Neon holds only each
shop's business data, keyed by Clerk user id (created on first login by the app's `/api/auth/sync-user`).
There is no waitlist table or waitlist API on the PrintPal backend. Both the website and the app's login page use Clerk's own components.

The site and the app share one Clerk instance.

- **Join the waitlist** uses Clerk's `<Waitlist />` component (in the dialog and the final section). Entries appear in the
  Clerk dashboard under **Waitlist**, where you invite people.
- **Sign in / Sign up** go to the app, whose Clerk screens create the session on the app's own domain, so people land
  inside PrintPal signed in.

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
