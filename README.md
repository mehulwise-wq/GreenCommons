# GreenCommons

A prototype web app that helps households, farms, schools and neighbourhoods cut carbon and save water, food and farm resources. It is plain HTML, CSS and JavaScript with no build step, and it installs from Chrome like an app.

## Put it online with GitHub Pages

1. Create a new repository on GitHub (for example `greencommons`). Public is simplest for free hosting.
2. Upload everything in this folder to the repository root. On the repository page choose **Add file > Upload files**, drag in all files and folders (keep `index.html` at the top level), then **Commit changes**.
3. Open **Settings > Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, then **Save**.
4. Wait a minute or two. Your app appears at `https://YOUR-USERNAME.github.io/greencommons/`.

## Install it on a phone

Open the link in Chrome on Android, tap the menu (three dots) and choose **Install app** or **Add to Home screen**. It then opens full screen and works offline. Inside the app, Profile also shows an **Install app** button when Chrome allows it.

## Try it

- Sign up with any 10-digit mobile number starting 6 to 9 and a Gmail-style address. The OTP is shown on screen because no SMS is sent.
- Settings > Prototype tools > **Add sample activity** fills in three weeks of example logs.
- Community demo codes: `GREEN-SCH`, `WARD-12`, `KISAN-1`, and `GREEN-SCH-ADMIN` for teacher tools.
- Devices: add a device with the code `DEMO` to simulate sensor readings.

## What is real and what is simulated

| Part | Status |
| --- | --- |
| Logging, scoring, levels, penalties, fair-use limits, badges | Working, stored on the phone |
| Impact, charts, reports, challenges, learning quizzes | Working |
| Sign-up OTP, Gmail check, one account per number | Simulated and local to one phone |
| Leaderboard, groups, fund pool | Demo data plus your own points |
| Vouchers | Simulated, labelled "Prototype reward" |
| Email and Share | Opens the phone's mail or share sheet |
| Languages | Hindi, Kannada, Marathi, Bengali and Gujarati cover navigation, buttons, deeds, rewards and help (`js/translations.js`). Long articles and tips stay in English. Machine-assisted wording: please have a native speaker review. Other languages are selectable but not translated |
| Online accounts, shared groups, server-side rule checks | Built in, switched off until you fill in `js/config.js` (see below) |
| Wi-Fi sensors | Browsers block plain http devices on https pages. Use Bluetooth or DEMO until the device software is ready |

## Switch on the online layer (free Supabase plan)

Until this is done the app runs fully offline and nothing leaves the phone.

1. Create a free project at supabase.com.
2. **SQL editor**: paste all of `supabase/schema.sql` and run it. It creates the tables, the deed rules and the checking functions.
3. **Authentication > Providers > Email**: switch **Confirm email** off (sign-in uses the mobile number and PIN, mapped to a hidden email).
4. **Project settings > API**: copy the **Project URL** and the **anon public** key into `js/config.js`. Never use the `service_role` key.
5. Commit and push. Open the app, sign up, then use Leaderboard > Online group with a shared code.

What the server does: it re-checks every deed (amount limits scaled by household, one entry per deed per day, one-time deeds, 200-point daily cap per area, date window) and keeps the group scores, so editing phone storage cannot add points online. Group members see first names and scores only.

Honest limits: a 4-digit PIN is guessable if someone can try many times, and the free plan's sign-in rate limit is the only brake, so use a longer PIN for anything important. Free projects pause after 7 days with no activity (resume from the dashboard) and are capped at 500 MB of data. The on-phone score is still shown to the user; the server score is the one groups use. Real SMS verification and voucher money are not included and cost money.

Rebuild the rules table after changing deed limits: `node tools/gen-rules.js` and re-run the insert it prints.

## Where the impact numbers come from

The About screen lists each factor as Sourced or Assumption with its link (CEA grid factor, ITF-OECD transport study, UNEP food waste, US EPA leak data, ICAR micro-irrigation). Assumptions are labelled and should be replaced as better sources are found.

## Files

- `index.html`, `css/styles.css`: the page and design system
- `js/data.js`: deeds, vouchers, badges, articles, challenges, demo data
- `js/store.js`: storage, scoring, penalties, reports
- `js/translations.js`, `js/i18n.js`: five Indian languages and the on-screen translator
- `js/config.js`, `js/cloud.js`, `supabase/schema.sql`, `tools/gen-rules.js`: the optional online layer
- `js/ui.js`: icons, sheets, charts
- `js/screens-*.js`: the 28 screens
- `js/app.js`: router and shell
- `sw.js`, `manifest.webmanifest`, `icons/`: offline and install support

## Before a public launch

- A real online service for phone verification, email and shared data.
- Native-speaker translations for every language.
- Sources for the impact figures (shown on the About screen).
- Final sensor hardware and its software.
