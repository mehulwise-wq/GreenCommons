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
| Languages | All 13 are selectable. Hindi covers main navigation and buttons. Other languages need translations in `js/i18n.js` |
| Wi-Fi sensors | Browsers block plain http devices on https pages. Use Bluetooth or DEMO until the device software is ready |

## Files

- `index.html`, `css/styles.css`: the page and design system
- `js/data.js`: deeds, vouchers, badges, articles, challenges, demo data
- `js/store.js`: storage, scoring, penalties, reports
- `js/ui.js`: icons, sheets, charts
- `js/screens-*.js`: the 28 screens
- `js/app.js`: router and shell
- `sw.js`, `manifest.webmanifest`, `icons/`: offline and install support

## Before a public launch

- A real online service for phone verification, email and shared data.
- Native-speaker translations for every language.
- Sources for the impact figures (shown on the About screen).
- Final sensor hardware and its software.
