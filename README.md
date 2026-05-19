# Concert Cost Tracker

Track what concerts really cost, rate how fun they were, and see dashboards with charts.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   copy .env.local.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project (**Real_Cost_of_Concerts** → Connect or Settings → API Keys). Use the **publishable** or **anon public** key only.

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Test flow

1. Sign up or log in on the login page.
2. Use **Add Concert** to save a show.
3. View **My Concerts** for your list.
4. Open **Dashboard** for stats and charts.
5. Try the theme selector on the login page and in the app header.

If sign-up asks for email confirmation, check your inbox or disable email confirmation under Supabase → Authentication → Providers → Email for local testing.

## Troubleshooting

### `ENOENT: ... .next\server\pages\_document.js`

This means the local build cache (`.next` folder) is corrupted or out of date. Fix it:

1. Stop the dev server (Ctrl+C in the terminal).
2. Run a clean start:

   ```bash
   npm run dev:clean
   ```

   Or manually delete the `.next` folder, then run `npm run dev`.

3. Hard-refresh the browser (Ctrl+Shift+R).

Do **not** run `npm start` unless you ran `npm run build` first.
