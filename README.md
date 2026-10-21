# AdVibe Studio — website + admin

A one-page website for an AI video ad agency, with a simple admin area.
This guide assumes **you have never done this before**. Follow it top to bottom.

---

## 0. The honest picture (read this first)

Here is exactly what is and isn't connected **right now**:

| Thing | Status | What it means |
|---|---|---|
| Public website | ✅ Works | Visitors see your copy, the 3D video wall, packages, the order form. |
| Order form → WhatsApp | ✅ Works | After ordering, the customer gets a button that opens WhatsApp with their details filled in. |
| Order form → **Make** | ✅ Wired in code, **needs your webhook URL** | Section 7 shows how. Until you add the URL, orders go nowhere except the visitor's own browser. |
| Make → **Google Sheets** | ⚙️ You build this in Make | Section 7. |
| Make → **SendFox** | ⚙️ You build this in Make | Section 7. (Needs the customer's email.) |
| **Supabase** | ❌ Not in the code at all | You don't need it to launch. Section 9 explains when you would. |
| Admin page | ⚠️ Works, but is a "preview-grade" tool | Section 1 explains its limits. Please read them. |

**The most important thing to understand:** this site has **no server**. It is just files on GitHub Pages. So anything a *visitor* types (like an order) disappears unless the code sends it somewhere. That "somewhere" is **Make**, which then puts it in **Google Sheets** and **SendFox**. **Your Google Sheet is your real list of leads.**

---

## 1. How to open the admin page

The admin lives at the same address as your site, with `#/admin` on the end.

| Where | Address |
|---|---|
| On your computer (while testing) | `http://localhost:3000/#/admin` |
| On the live site (GitHub Pages) | `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/#/admin` |

There is deliberately **no public link** to it on the website, so you must type it.

**Sign in with:**

| Role | Email | Password | Can see |
|---|---|---|---|
| Owner | `owner@advibe.studio` | `owner2026` | Everything, including Settings |
| Operations | `ops@advibe.studio` | `ops2026` | Everything except Settings |

### Change these passwords before you go live
Open `src/content/defaultContent.ts`. At the very top you'll see:

```ts
export const ADMIN_USERS: AdminUser[] = [
  { email: 'owner@advibe.studio', password: 'owner2026', name: 'Adaeze O.', role: 'owner' },
  { email: 'ops@advibe.studio',   password: 'ops2026',    name: 'Tunde B.',  role: 'ops'   },
];
```
Change the emails, passwords and names, save, and redeploy (Section 6).

### What the admin can and can't do — please read
The admin was built as a prototype. Three things you must know:

1. **The login is a lock on a glass door.** The passwords live inside the website's code, so a technical person could find them. Never put anything secret in the admin. Real security needs a real backend (Section 9).
2. **Everything you do in the admin is saved only in *your* browser** (this is called *localStorage*). If you edit your pricing in the admin, **visitors will not see the change**, and you won't see it on your phone either.
3. **The "Leads" and "Projects" tabs start with fake demo data** (sample companies) and only show orders placed *in your own browser*. They are **not** your real leads. Your real leads are in **Google Sheets** (Section 7).

**So how do you change what visitors see?** Edit `src/content/defaultContent.ts` (Section 4) and push to GitHub. The admin's Website tab is useful as a *preview playground*, not as a live editor.

---

## 2. Run it on your computer

You only do the installs once.

1. Install **Node.js** (the "LTS" version) from https://nodejs.org
2. Install **VS Code** (a free code editor) from https://code.visualstudio.com
3. Open this project folder in VS Code (File → Open Folder).
4. Open the terminal in VS Code (Terminal → New Terminal) and type:

```bash
npm install     # downloads everything the site needs (1–3 minutes, first time only)
npm run dev     # starts the site
```
5. Open **http://localhost:3000** in your browser. Edit a file, save, and the page updates by itself.
6. Stop it with `Ctrl + C`.

---

## 3. What the new design is

The page now follows the aistrikeforce.com style — **your copy is unchanged**:

- **Floating pill navigation** that turns more solid when you scroll.
- **Soft peach-and-mint hero** with a drifting glow and film grain.
- **The video "wall"** — your portfolio videos on a 3D ring you can drag, flick, scroll or use arrow keys to spin. It slowly drifts by itself, slows when you hover, and pauses when a video is playing. Tap a card to watch.
- **Fonts:** *Bricolage Grotesque* (headlines), *Figtree* (body), *Instrument Serif Italic* (the one italic word in each heading), *Caveat* (the little handwritten notes), *JetBrains Mono* (small numbers).
- **Colour-blocked cards** (peach / mint / butter / sky / lilac), dark rounded "bands" for the seasonal and final sections.

**Heads-up on the italic words:** the site automatically puts the **last word** of each heading in the serif-italic style. You don't have to do anything — just write your headings normally.

**Where the design lives**

| File | What it controls |
|---|---|
| `src/studio.css` | Colours, fonts, nav, hero, the 3D wall. **Start here for design changes.** |
| `src/sections/chrome.tsx` | Nav, event banner, hero, wall, stats + marquee, mobile bar |
| `src/sections/sections.tsx` | Problem, Services, Events, Pricing, Why us, Process, Testimonials, FAQ, Final CTA, Footer |
| `src/components/OrderModal.tsx` | The order form pop-up |

**Change the main colour:** in `src/studio.css`, find `--brand: 1 216 126;` (that's green as Red Green Blue). Change those three numbers (e.g. `245 165 36` for gold) and the whole site updates.

**Videos for the wall:** the wall uses the YouTube thumbnails of your portfolio items. Add or reorder videos in `portfolio` inside `defaultContent.ts` (Section 4). Each needs a `youtubeId` — the part after `v=` in a YouTube link, or after `/shorts/`. Use real IDs of your own videos (the current ones are placeholders).

---

## 4. Changing your words, prices and videos

**Every piece of text lives in one file:** `src/content/defaultContent.ts`. Open it, find the words, change them, save. Examples:

- Headline → `hero.headline`
- Prices → `offers` (each has `price`)
- FAQ → `faqs`
- Sales-season banner + countdown → `campaigns` and `banner`
- WhatsApp number → `settings.whatsappNumber` (digits only, with country code, e.g. `2348012345678`)
- Bank details shown after ordering → `settings.paymentInstructions`

Some headings (like "Every kind of ad your feed is missing.") are written directly in `sections.tsx`; search the file for the words to change them.

---

## 5. Putting the project on GitHub (you have un-saved work!)

Your project folder currently has only one "save point" (called a *commit*), and it's from the blank template. **All of your real work is un-committed.** Commit it:

```bash
git add .
git commit -m "AdVibe Studio site with new design"
```

Then create an empty repository on https://github.com (button **New**), and copy the lines GitHub shows you under "push an existing repository", which look like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

---

## 6. Going live on GitHub Pages

A ready-made robot is included (`.github/workflows/deploy.yml`). It builds and publishes your site every time you push.

1. On GitHub: your repo → **Settings → Pages → Source: "GitHub Actions"**.
2. Push your code (Section 5). Click the **Actions** tab to watch it run (about 2 minutes). A green tick = live.
3. Your site is at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

> ✅ **I fixed a deploy-blocker for you:** your `package-lock.json` pointed at a private download mirror (`npm.mirrors.msh.team`) that isn't reachable from outside the tool that generated it. That would have made the GitHub build fail. It now points to the normal npm registry.

Later changes: edit → `git add .` → `git commit -m "what I changed"` → `git push`. Done.

---

## 7. Connecting leads: Website → Make → Google Sheets + SendFox

```
 Customer fills the form
          │
          ▼
   Make (webhook)  ──►  Google Sheets  (your lead list)
          │
          └─────────►  SendFox         (email list, only if they gave an email)
```

### Step A — Make a Google Sheet
1. Create a new Google Sheet. Name the tab `Leads`.
2. In **row 1**, type these headers, one per column, exactly:

`ref` · `submitted_at` · `name` · `whatsapp` · `email` · `business` · `industry` · `product` · `offer_name` · `price` · `event` · `notes` · `utm_source` · `status` · `payment_status` · `page_url`

### Step B — Create the Make scenario
1. In Make, **Create a new scenario**.
2. Click the big **+**, search **Webhooks → Custom webhook → Add**. Name it "AdVibe leads". **Copy the webhook URL** it shows (starts with `https://hook...make.com/`).
3. Click **Run once** (the scenario now waits for data).
4. Do Step C below and submit one test order. Make will say it determined the data structure and learn all the field names.
5. Add a second module: **Google Sheets → Add a Row**. Connect your Google account, pick your spreadsheet and the `Leads` tab, then match each column to the matching field from the webhook.
6. Add a third module: **SendFox → Create a Contact**. In SendFox, go to your account's **API** tab → **Create New Token**, copy it, and paste it when Make asks to connect. Map `email` to the email field and `name` to first name. Pick which SendFox list they join.
   - **Important:** SendFox needs an email, but your form makes email *optional*. Click the line between the webhook and SendFox, choose **Set up a filter**, and set: *email → Exists*. People without an email still reach Google Sheets, they just skip SendFox.
7. Switch the scenario **ON** (bottom-left toggle) and set it to run **Immediately**.

### Step C — Give the website your webhook URL

**To test on your computer:** copy `.env.example` to a new file named `.env`, and paste your URL:
```
VITE_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/abc123...
```
Stop and restart `npm run dev`, place a test order, and check Make and the Sheet.

**For the live site:** GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**. Name: `VITE_MAKE_WEBHOOK_URL`, value: your URL. Then re-run the deploy (Actions tab → "Deploy to GitHub Pages" → Run workflow).

> ⚠️ The admin's "Make webhook URL" box only affects *your* browser. Use `.env` / the GitHub secret for the real one.

### Good to know
- The order form still works if Make is down — the customer isn't blocked and still gets the WhatsApp button.
- Your webhook URL is visible to anyone who inspects the site (unavoidable on a static site). If spam ever shows up in your Sheet, delete that webhook in Make, create a new one, and update the GitHub secret. The form already has a hidden "honeypot" field that stops basic bots.
- The browser sends the data in "no-cors" mode, so the site can't read Make's reply and can't show "failed" if your URL is wrong. **Always place one test order after changing the URL.**
- You can also add a Make module to message you on WhatsApp/email the moment a lead arrives.

---

## 8. Quick reference

```bash
npm install        # first time only
npm run dev        # work on the site at http://localhost:3000
npm run build      # make the final site in /dist (GitHub does this for you)
git add . && git commit -m "message" && git push    # publish a change
```

---

## 9. Supabase — do you need it?

**Not to launch.** Nothing in this project talks to Supabase today (the early README mentioned it as a *future option*).

Supabase is a database + login service. You'd add it **later** if you want: a real admin login (not the glass-door one), leads and edits that appear on every device, or a client portal. That's a bigger piece of work — when you're ready, ask for it as its own task. Until then, **Google Sheets is your database.**

---

## 10. If something goes wrong

| Problem | Try this |
|---|---|
| `npm: command not found` | Install Node.js (Section 2) and reopen the terminal. |
| Blank page on GitHub Pages | Settings → Pages → Source must be **GitHub Actions**. Check the Actions tab for a red ✗. |
| Admin shows fake companies | That's the demo data — real leads are in your Sheet. |
| My admin edits disappeared on my phone | Admin saves per browser. Edit `defaultContent.ts` instead (Section 4). |
| Nothing arrives in Make | Is the scenario on, or waiting on "Run once"? Is the URL in `.env` (or the GitHub secret) exact? Did you restart `npm run dev` after editing `.env`? |
| Wall is empty | You need at least one `portfolio` item with `visible: true`. |
| Wall thumbnails look black | The `youtubeId` is wrong or the video is private. |
| Wall doesn't drift | Your device may have "reduce motion" on — that's respected on purpose; you can still drag it. |

### Words you'll meet
- **Repository (repo):** your project's folder on GitHub.
- **Commit:** a saved snapshot of your work.
- **Push:** upload your commits to GitHub.
- **Webhook:** a web address that receives data, like a letterbox.
- **Environment variable (`.env`):** a private setting kept out of the code.
- **localStorage:** a small notepad your browser keeps for one website, on one device.
