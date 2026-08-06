# MASTER BUILD SPECIFICATION
## Official Website — Barangay Tumbod, Taytay, Palawan, Philippines

**Document type:** Agent build prompt + product specification
**Status:** Authoritative. Supersedes all prior briefs.
**Read time before first line of code:** all of it.

---

## 0. RULES OF ENGAGEMENT — READ BEFORE ANYTHING ELSE

You are the design lead and full-stack engineer. This is a real public-sector product for a real island community of ~1,744 people. It will be used by people on ₱50-load prepaid data to find out whether the boat is running and whether the health team is coming. Treat it that way.

### 0.1 The three hard gates

You may not proceed past a gate until its exit condition is met. If you skip a gate, the work is rejected in full.

| Gate | Name | Exit condition |
|---|---|---|
| **GATE 1** | Research & Discovery | `RESEARCH.md` + `DISCOVERY-QUESTIONS.md` delivered. Human has answered the blocking questions in §4.1. |
| **GATE 2** | Design | `DESIGN-PLAN.md` + `DESIGN-SYSTEM.md` + wireframes delivered, self-critiqued per §34.1 Round 1, and approved by the human. |
| **GATE 3** | Implementation | All acceptance criteria in §34 pass. Self-review §34.1 Round 2 completed and pasted with measurements. |

**Do not write a single line of application code before GATE 2 is approved.** Writing a "quick prototype to explore" is a violation. Writing Tailwind config early is a violation. The only files you may create before GATE 2 are markdown documents.

### 0.2 Invention is forbidden

You will not have real data for officials, boat schedules, fees, or hotlines. You must not invent them.

- Every unknown becomes a typed placeholder constant, not a plausible-looking fake.
- Every placeholder is registered in `CONTENT-TODO.md`.
- Every placeholder renders in the UI with a visible `data-placeholder="true"` attribute and, in development mode only, a magenta outline.
- Placeholder text pattern: `[[NEEDS DATA: description — source: who can provide it]]`
- A build with `NODE_ENV=production` and `NEXT_PUBLIC_ALLOW_PLACEHOLDERS !== "true"` **fails CI** if any placeholder constant is reachable from a rendered route. Write that check as a real script.

Fabricating a hotline number on a disaster page for an island in a typhoon corridor is the single worst failure mode of this project. There is no acceptable version of it.

### 0.3 Verification duty

Population, coordinates, barangay count, MSPLS status, and every other factual claim must be checked against PSA, PhilAtlas, DENR/PCSD, and the barangay itself. Cite the source inline in `RESEARCH.md` with a retrieval date. Anything unverified is marked `{/* TODO: confirm — source: ___ */}` in code and listed in `CONTENT-TODO.md`.

### 0.4 Scope discipline

Build what is specified. If you believe something in this spec is wrong, say so in two sentences, state your assumption, and build it anyway. Do not silently narrow scope. Do not silently expand it. If a section is blocked, complete every other section fully and report exactly what you left out and why.

---

# PART I — DISCOVERY

## 1. EXECUTIVE SUMMARY

Barangay Tumbod is an island barangay on Tuluran Island in Outer Malampaya Sound, Taytay, Palawan (approx. 10.9856°N, 119.2773°E). It shares no land border with any other barangay. Every person, document, sack of rice, and medical emergency moves by *bangka*.

Today its only online presence is a Facebook page. That page is unsearchable, unarchivable, requires an account, requires data, and disappears behind an algorithm. Barangay clearance requirements, ordinances, budget disclosure, and typhoon instructions are not the kind of information that should live in a social feed.

This project builds a permanent, offline-capable, bilingual public website that:

1. Answers *"what do I need to know today, living on this island?"* in the first screen, before any scrolling.
2. Publishes document requirements, fees, and processing times so nobody makes a boat trip for a missing photocopy.
3. Meets the Full Disclosure Policy obligations in a format a resident can actually read.
4. Puts emergency and sea-travel information one tap away from every page.
5. Can be maintained by the Barangay Secretary with no technical training.
6. Still opens when there is no signal.

**Definition of success (measurable, 6 months post-launch):**

| Metric | Target |
|---|---|
| Repeat visits from Tumbod-area mobile IPs | ≥ 30% of sessions |
| Median LCP, simulated Slow 4G, cold cache | ≤ 2.0 s |
| Initial route transfer, HTML+CSS+JS+fonts | ≤ 150 KB |
| Announcements published by barangay staff, unassisted | ≥ 2 / month |
| Service-request submissions | > 0 (proves trust, not volume) |
| Lighthouse Performance / A11y / Best Practices / SEO | ≥ 95 each, ≥ 100 on A11y |
| Documented "wasted boat trip avoided" anecdotes | collect qualitatively at 6 months |

**Explicit non-goals:** online payments at v1; e-signature or automated document issuance; a tourism portal; a chatbot; a mobile app in a store.

---

## 2. PROJECT VISION

> **Ang website na ito ay para sa taong nakatayo sa pantalan, may isang bar ng signal, at kailangang malaming kung tuloy ba ang biyahe.**
> *(This website is for the person standing on the pier with one bar of signal who needs to know whether the boat is running.)*

Three principles, in priority order. When they conflict, the lower number wins.

**1. Utility over ceremony.** A government website's first job is not to show the seal and the captain's portrait. It is to answer questions. The seal goes in the footer and the metadata; the questions go at the top.

**2. The sea is the interface.** On the mainland, "what's the weather" is small talk. Here it determines whether you can reach a hospital, sell a catch, or get a signature. Sea state, boat status, and travel conditions are first-class navigational content, not a widget.

**3. Works when nothing else does.** Assume 2G. Assume a browser tab reopened three days later in a brownout. Assume a signal-less evacuation center. If the site is useless in those states, it is useless when it matters most.

**Design thesis:** this site should look like a **working chart of a working island** — a hydrographic document, marked up by people who use it — not like a civic brochure.

---

## 3. RESEARCH PHASE — MANDATORY, PRECEDES ALL DESIGN

Produce `RESEARCH.md`. It is not a formality; the design plan must cite it.

### 3.1 Facebook page reverse-engineering (required)

**Source:** https://www.facebook.com/profile.php?id=61579831854802

You must systematically extract from this page. If you cannot access it programmatically, say so explicitly and produce a **manual extraction worksheet** for the human to fill — do not silently skip and do not guess.

Extract and tabulate:

**A. Brand assets**
- Profile photo / seal: download at maximum available resolution. Record dimensions, whether it is a scan or a vector-like render, background transparency, legibility at 32px.
- Cover photo: what is depicted? Sea, pier, officials, seal on gradient? This tells you what the barangay thinks it looks like.
- Any recurring poster/tarpaulin template — fonts, colors, layout conventions the community already recognizes.

**B. Color extraction — do this properly**
- Sample 8–12 photographs from the page (boats, pier, buildings, sea, uniforms, tarpaulins).
- Run k-means (k=6) per image; aggregate. Record the resulting palette as swatches with the source photo noted.
- Separately record the *official* colors used in seals/tarps (these are usually different, and usually worse).
- Output a table: `hex | source | frequency | proposed role | contrast vs. white | contrast vs. ink`
- **This extracted palette is evidence, not the answer.** §8.2 and §9.1 tell you how to turn it into a system.

**C. Content taxonomy**
- Classify the last 30–50 posts into: announcement, health/medical outreach, relief/ayuda, disaster advisory, ordinance/resolution, event, meeting minutes, congratulatory/ceremonial, other.
- Record the frequency of each. **The most frequent categories dictate the CMS content types and the homepage layout.** If 40% of posts are health outreach schedules, "next health outreach" is a homepage module — as §12 already assumes; confirm or correct it.
- Record posting cadence (posts/month) — this sets realistic expectations for the news feed's empty states.

**D. Voice and language**
- Transcribe 10 representative post openings verbatim.
- Record: Filipino vs. English vs. code-switched ratio; formality register; use of honorifics (`Kgg.`, `Hon.`, `Brgy. Kap.`); emoji conventions; how they announce vs. how they warn.
- **Your site copy must be a cleaned-up version of this voice, not a fresh voice.** Residents already know how their barangay talks.

**E. Facts harvestable from posts**
- Names and titles of officials appearing in posts (cross-check against any official roster — treat as unconfirmed until the barangay confirms).
- Recurring hotline numbers.
- Named evacuation sites, puroks, landmarks, pier names.
- Boat operator names, departure times, fares — if mentioned.
- Recurring partner organizations (NGOs, DSWD, DOH, PCSD, municipal offices).

**F. Engagement signals**
- Which post types get the most comments/shares? That is your traffic prediction. Design for it.
- Read the comments: what do residents actually *ask*? Those questions are your FAQ, your service-page headings, and your search index.

### 3.2 Place research

- **Geography:** Tuluran Island, Outer Malampaya Sound. Confirm coordinates, land area, purok count and names, distance and bearing to Liminangcong and to Taytay poblacion.
- **Bathymetry & hydrography:** obtain depth contour data for Malampaya Sound (NAMRIA charts, GEBCO, EMODnet-equivalent, or OpenStreetMap coastline + published soundings). You will need real contour geometry for the signature element in §11. If genuine bathymetry is unobtainable, use *real coastline geometry* at minimum, and label the depth motif as stylized in `RESEARCH.md`. **Do not draw fake depth numbers on a chart of a real navigable sound.**
- **MSPLS:** Malampaya Sound Protected Land and Seascape — legal basis, zoning (core/buffer/multiple-use), which zones touch Tumbod, what fishing rules apply. Note the conservation agreements covering reef and mangrove areas around Tumbod and Liminangcong, and the role of *Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod*.
- **Demographics:** PSA 2020 — 1,744 persons, ~2.09% of Taytay. PSA 2015 — 1,489 persons, 273 households (~5.5/household), largest age band 5–9. Verify all. Obtain 2024 census figures if published.
- **Hazard profile:** typhoon tracks crossing northern Palawan, storm surge exposure, historical events affecting Taytay. Cite PAGASA / NDRRMC / provincial DRRM.
- **Connectivity reality:** which carriers have coverage on Tuluran Island, typical technology (2G/3G/LTE), whether there is a local wifi/satellite point, whether electricity is 24h or scheduled. **This determines the offline strategy, not your guesses.** If unobtainable, put it in `DISCOVERY-QUESTIONS.md` as blocking-adjacent and design for the worst case: intermittent 2G, scheduled power.

### 3.3 Competitive / precedent scan

Review 5+ Philippine LGU sites (mix of barangay, municipal, provincial) and 3+ non-Philippine coastal/island public sites.

For each record: what works, what fails, what the visual defaults are. Produce an explicit **"what everyone does that we will not do"** list. This list feeds §35.

### 3.4 Research deliverable

`RESEARCH.md` containing: extracted palette table with source photos; content taxonomy with frequencies; voice sample transcriptions; verified fact table with citations and retrieval dates; hazard profile; connectivity findings; precedent scan with the anti-pattern list; and an explicit **"unknowns that block design"** section.

---

## 4. DISCOVERY REQUIREMENTS

Produce `DISCOVERY-QUESTIONS.md`. Group questions as **BLOCKING** (cannot design without) and **NON-BLOCKING** (can proceed with a stated assumption).

### 4.1 Blocking questions — stop and ask

1. **Officials.** Full roster with correct spelling and honorifics: Punong Barangay; 7 Kagawad with committee assignments; SK Chairperson + SK Kagawad; Secretary; Treasurer; Lupong Tagapamayapa; BHWs; BNS; Tanod. Term start/end dates. Photos — do we have them, at what quality, and is there written consent to publish each one?
2. **Online document requests — yes or no?** Does the barangay want to receive requests through the site at all, or only publish requirements? If yes, who monitors the inbox, on what device, how often, and what happens when they are off-island?
3. **Emergency numbers.** Exact, verified, currently-answered numbers for: Barangay hotline, BDRRMC, Tanod, BHW/health, municipal DRRMO, Coast Guard station of jurisdiction, nearest hospital/RHU, PNP. **Who confirms these are live, and how often are they re-confirmed?**
4. **Boat reality.** Actual routes to/from Tumbod (from Liminangcong? Taytay poblacion? both?), operator names, departure times, typical duration, fare, and — critically — **who decides and announces that a trip is cancelled, and how would that reach this website?**
5. **Hosting and domain.** Barangay-funded or municipal? Is a `.gov.ph` domain available/desired (this changes procurement and DNS timeline substantially)? Who holds the credentials in year 2?
6. **Who maintains it.** Named person, their device, their comfort level. If the answer is "nobody," the CMS design changes fundamentally and we build for near-zero maintenance.

### 4.2 Non-blocking (proceed with stated assumption)

7. Seal/logo source files (vector preferred). *Assumption if absent: trace the Facebook profile image to SVG, mark as unofficial pending replacement.*
8. Existing photography and its licensing. *Assumption: use only Facebook-page imagery with permission, otherwise ship with illustrated/chart-based imagery and zero stock photos.*
9. Purok names and count. *Assumption: placeholder Purok 1–N, flagged.*
10. Office hours, including whether they change seasonally or during habagat. *Assumption: Mon–Fri 08:00–17:00, flagged.*
11. Fee schedule per document, and the ordinance that sets it. *Assumption: placeholder, flagged.*
12. Preferred language default. *Assumption: Filipino default per this spec.*
13. Whether officials' personal mobile numbers may be published, or only an office line. *Assumption: office line only — the privacy-safe default.*
14. Data privacy: is there a designated Data Protection Officer, and an existing privacy notice? *Assumption: none; we draft one (§24).*
15. Analytics tolerance — is any third-party analytics acceptable? *Assumption: self-hosted, cookieless only.*

---

## 5. USER PERSONAS

Personas are design constraints, not decoration. Every homepage module must serve a named persona. If it serves none, delete it.

### P1 — Marilou, 38, fish vendor, Purok 2 · **PRIMARY**
- Android Go phone, 2 GB RAM, Chrome, cracked screen, 4-year-old OS.
- ₱50 prepaid load; data lasts 3 days if careful. Facebook is Free Data; the open web is not — **she is paying to load your site.**
- One bar of signal near the pier; none at home.
- Reads Filipino comfortably; English slowly.
- **Needs:** Is the boat running tomorrow? What do I bring for a barangay clearance so I don't waste the trip? When is the ayuda distribution? Is the health team coming?
- **Fails if:** the page is a hero image and a carousel; requirements are a PDF; the answer is three taps deep; the site costs more than 200 KB to answer one question.
- **Design implications:** answers above the fold, in Filipino, as text. Byte budget is a courtesy to her wallet.

### P2 — Kap. Rene, 52, Punong Barangay · **PRIMARY**
- Mid-range Android, uses Facebook fluently, has never used a CMS.
- Wants the barangay to look competent to the municipality and to funders.
- Will personally ask for a photo of himself on the homepage. **Have a prepared, respectful answer:** the seal and leadership are on About and Officials, prominent and dignified; the homepage's job is service to residents, and that reflects better on the administration than a portrait does. Offer a "Mensahe ng Punong Barangay" block on About/Home-lower as the compromise.
- **Design implications:** Officials page must be genuinely good, not perfunctory. Approval workflow must let him see what goes out.

### P3 — Aling Fe, 41, Barangay Secretary · **PRIMARY (the maintainer)**
- The person who determines whether this site is alive in 18 months.
- Uses Facebook, Messenger, and Word. Types on a phone more than a laptop.
- Time budget: ~10 minutes per announcement, between five other tasks.
- **Needs:** post an announcement in under 5 minutes, on a phone, without help; attach a photo without knowing what "compression" means; fix a typo without fear of breaking the site.
- **Fails if:** the CMS has a markdown editor with no preview; there is a build step she must trigger; a broken field takes down a page; anything says "commit."
- **Design implications:** the admin is a product with equal design weight to the public site. Autosave, undo, preview, plain-language validation, no jargon, Filipino UI.

### P4 — Jomar, 17, SK Kagawad · SECONDARY
- Most digitally fluent person in the barangay. Will be your unofficial support desk.
- **Needs:** post SK activities, show SK budget, prove the SK does things.
- **Design implications:** SK content is not a subsection of an afterthought — give it real surface. Make him a second CMS role.

### P5 — Ms. Alvarez, 34, municipal / NGO / researcher · SECONDARY
- Laptop, good connection, arrives via Google.
- **Needs:** official roster, ordinances as PDFs, budget disclosure, population figures, MSPLS context, a citable contact.
- **Design implications:** desktop transparency tables must be genuinely usable; documents downloadable and named sanely; SEO and structured data matter; English toggle must be complete, not partial.

### P6 — Ate Josie, 45, OFW in Dubai, from Purok 3 · SECONDARY
- Good connection, 4-hour timezone offset, checks during typhoons at 3 a.m. her time.
- **Needs:** is my family's purok flooded? is there an evacuation? who do I call? how do I send help?
- **Design implications:** advisory content must carry an explicit timestamp and "as of" line. A stale advisory during a typhoon is dangerous. Timestamps are relative *and* absolute with timezone.

### P7 — "Ka Ben," 61, fisherman, low literacy · EDGE, DO NOT IGNORE
- Reads slowly. Relies on his daughter to check the phone.
- **Design implications:** icons paired with words; sea condition communicated by color + word + icon, never color alone; no thin type; body text never below 16px; plain language tested at roughly Grade 6 reading level in Filipino.

---

## 6. INFORMATION ARCHITECTURE

### 6.1 Principle

Organized by **resident need**, not by org chart. Nobody has ever thought "I need to visit the Office of the Sangguniang Barangay." They think "kailangan ko ng clearance."

### 6.2 Sitemap

```
/                               Ngayon sa Tumbod (Home — today-first dashboard)
│
├── /ligtas                     Ligtas (Safety & Disaster)        ← reachable in 1 tap globally
│   ├── /ligtas/bagyo           Typhoon preparation & checklist
│   ├── /ligtas/dagat           Sea conditions & boat travel safety
│   ├── /ligtas/likasan         Evacuation sites (map + capacity)
│   ├── /ligtas/hotline         Full hotline directory
│   └── /ligtas/bdrrmc          BDRRMC roster & responsibilities
│
├── /serbisyo                   Mga Serbisyo (Services)
│   ├── /serbisyo/[slug]        One page per document type
│   │     barangay-clearance · sertipiko-ng-indigency ·
│   │     sertipiko-ng-paninirahan · business-clearance ·
│   │     barangay-id · blotter-katarungang-pambarangay
│   ├── /serbisyo/humiling      Online request form (conditional on §4.1 Q2)
│   └── /serbisyo/subaybayan    Track a request by reference number
│
├── /balita                     Balita at Anunsyo (News)
│   ├── /balita/[slug]          Single post
│   ├── /balita/kategorya/[c]   Category archive
│   └── /balita/facebook        Facebook mirror (clearly labeled)
│
├── /transparency               Full Disclosure Board
│   ├── /transparency/badyet    Annual budget
│   ├── /transparency/sk        SK budget & programs
│   ├── /transparency/proyekto  Projects & status
│   ├── /transparency/procurement
│   └── /transparency/ordinansa Ordinances & resolutions (searchable)
│
├── /opisyal                    Mga Opisyal (Officials)
│   ├── /opisyal/[slug]         Individual profile
│   └── /opisyal/lupon          Lupong Tagapamayapa
│
├── /tungkol                    Tungkol sa Barangay (About)
│   ├── /tungkol/kasaysayan     History
│   ├── /tungkol/heograpiya     Island geography & puroks
│   ├── /tungkol/malampaya      MSPLS & marine conservation
│   └── /tungkol/populasyon     Demographics
│
├── /kontak                     Contact & how to physically reach Tumbod
├── /kalendaryo                 Barangay calendar
├── /form                       Downloadable forms index
│
├── /admin/*                    CMS (auth required)
├── /api/*                      API routes
├── /privacy · /accessibility · /sitemap.xml · /robots.txt · /manifest.webmanifest · /offline
```

**English mirror:** every public route available at `/en/*` with identical structure and complete translation. No partial English pages. Filipino is canonical (`hreflang` `fil` default, `x-default` → Filipino).

### 6.3 Navigation model

- **Persistent top bar:** seal + wordmark · Emergency button (always visible, always red, never scrolls away) · language toggle · menu trigger.
- **Mobile:** the emergency button is a fixed element in the header — not a FAB that covers content, not a footer link. Header is `position: sticky` with a compact scrolled state.
- **Primary nav (5 items max):** Ngayon · Serbisyo · Balita · Ligtas · Higit pa. Everything else lives under "Higit pa" or in the footer.
- **Breadcrumbs** on every page below depth 1, with `BreadcrumbList` JSON-LD.
- **No mega-menu. No carousel. No hamburger-only navigation on desktop.**
- **Search** is site-wide, client-side, over a prebuilt static index (≤ 25 KB gzipped, lazy-loaded on focus). Must find ordinances by number and services by colloquial name ("clearance", "cedula", "indigency", "barangay ID").

### 6.4 URL rules

Filipino slugs on the Filipino tree, lowercase, hyphenated, no dates in paths (dates change, meaning doesn't), no IDs in public URLs, permanent — if a URL must change, ship a 301.

---

## 7. UX STRATEGY

### 7.1 The governing question

Every screen answers: **"Ano ang kailangan kong malaman ngayon?"**

The homepage answers it directly. Every other page answers a narrower version of it. If a section of a page answers no question a persona actually has, delete the section.

### 7.2 Interaction principles

1. **Answer first, context second.** Sea condition: the word "MALAKAS" before the wave height. Service page: fee and requirements before the legal basis.
2. **Never make someone travel to learn something.** The complete requirement checklist, the fee, the hours, and the name of the person to approach are on the page. That is the entire value proposition.
3. **State honestly.** Show "Huling na-update: 3 oras ang nakalipas" everywhere it matters. On advisories, staleness beyond a threshold triggers a visible warning, not silence.
4. **Progressive disclosure with real defaults.** Collapse detail, never collapse the answer. An accordion that hides the fee is a bug.
5. **One task per screen on mobile.** No side-by-side compromises at 360px.
6. **Offline is a designed state, not an error.** Cached pages render with a subtle "Naka-offline — huling nakuha [time]" band, not a browser error page.
7. **Forms forgive.** Autosave to `localStorage` per keystroke (debounced). Inline validation on blur, never on keystroke. Errors say what to do. A dropped connection at submit queues the request via Background Sync and tells the user plainly.

### 7.3 Content strategy

- Filipino is written first, in the voice extracted in §3.1D. English is a translation, not the source.
- Reading level: roughly Grade 6 in Filipino. No legalese in resident-facing copy — cite the ordinance, then say what it means.
- Requirements are **checkboxes**, not prose. A person should be able to stand at their door, run down the list, and know they can leave.
- Buttons state outcomes: `Ipadala ang request`, `I-download ang ordinansa (PDF, 240 KB)`, `Tumawag sa hotline`. Never `Submit`, `Click here`, `Learn more`.
- Empty states give direction: *"Wala pang anunsyo ngayong buwan. Ang mga bagong abiso ay ipa-post dito at sa Facebook page ng barangay."*
- Error states give a next action and a human to contact.
- Every download declares format and size before the tap. On metered data this is not a nicety.

### 7.4 Trust design

Public trust in a barangay website is earned by specificity. Named people with real titles. Timestamps. Cited ordinance numbers. Honest "we don't have this yet" instead of an empty perfect-looking table. An "as of" date on every number. A visible correction policy.

---

# PART II — DESIGN

## 8. VISUAL IDENTITY SYSTEM

### 8.1 Concept: *The Working Chart*

Not a brochure. Not a portal. **A nautical chart that is actually used** — with depth contours, a real pin, hand-annotated margins, and a legend. Charts are functional, precise, legible in bad light, and they encode danger. That is the correct register for an island barangay in a typhoon corridor.

This concept must be **structural**, not a background texture. If you could delete the chart motif and the site would work identically, you have applied a skin, not built an identity. Redo it.

### 8.2 Color

**Sourcing rule:** every color traces to §3.1B extraction or to a documented physical referent in Malampaya Sound. State the source next to the hex. If a color's justification is "it looked good," it is out.

Deliver 5–6 named tokens minimum, plus semantic assignments. Draw from the real visual world:

- **Bangka hulls and outriggers** — Palawan boats are painted in unhesitating hardware-store colors. Hard yellow, sky blue, hot red, white. They are not tasteful. That is the point, and it is the honest source of accent color.
- **Mangrove** — green so dark it reads black in shadow, with a wet olive edge.
- **Malampaya at noon** — bleached sand, glare, a sky-water boundary that goes almost white.
- **Chart paper** — not cream. Charts are pale, cool, and slightly green- or blue-shifted, printed with magenta and cyan line work.

**Forbidden by name:** navy + gold "government blue"; `#F4F1EA` warm cream with a terracotta accent; near-black with a single acid-green accent; any blue→purple gradient; a palette that averages to "corporate SaaS teal."

**Required deliverable — token table:**

| Token | Hex | Physical source | Role | Contrast vs. surface | Contrast vs. ink |
|---|---|---|---|---|---|
| *(fill from research)* | | | | | |

**Semantic layer (must exist separately from the raw palette):**

```
--surface, --surface-raised, --surface-sunken, --surface-inverse
--ink, --ink-muted, --ink-inverse
--line, --line-strong
--accent, --accent-ink            (the bangka color — used sparingly, high impact)
--interactive, --interactive-hover, --interactive-visited
--focus-ring
--sea-calm, --sea-moderate, --sea-rough, --sea-dangerous
--status-open, --status-closed, --status-limited
--alert-info, --alert-advisory, --alert-warning, --alert-emergency
--chart-contour-1 … --chart-contour-5   (depth bands)
```

**Rules:**
- Components consume **semantic tokens only.** A raw hex or a raw palette token inside a component is a lint error. Enforce it.
- Contrast: 4.5:1 body, 3:1 large text and UI boundaries, 3:1 for any non-text element carrying meaning.
- **Color is never the sole carrier of meaning.** Sea state = color + word + icon + (where relevant) a number. Ka Ben (§5, P7) must be able to read it.
- Dark mode: required, and it is not an inversion. Night use is real here (brownouts, pre-dawn departures, typhoon nights). Reduce luminance, keep chart line work legible, keep emergency red unmistakable at low brightness.
- Emergency red is reserved. It appears in exactly one semantic role and never as decoration.

### 8.3 Typography

Three roles. Self-host, subset to Latin + Filipino diacritics (`á é í ó ú ñ Ñ` and combining marks) + the punctuation and figures you actually use. **Total font payload ≤ 100 KB across all faces and weights.** WOFF2 only. `font-display: swap`. Preload only the body regular.

| Role | Requirement | Justification must state |
|---|---|---|
| **Display** | A characteristic face with real personality, used at ≤ 3 sizes and only for page titles, the emergency banner, and section markers. Consider condensed grotesques, chart/cartographic lettering, or a signage face — not another editorial serif. | Why this face belongs to *this* place, in one line. |
| **Body** | Workhorse sans or low-contrast serif with excellent Filipino diacritic coverage, high x-height, legible at 16px on a cheap LCD. | Why it survives a bad screen. |
| **Mono / figures** | Tabular figures for tide times, fees, ordinance numbers, boat departures, reference numbers, coordinates. Must have unambiguous `0/O` and `1/l/I`. | Why numbers on this site need to be scannable in a column. |

**Scale** — fluid, `clamp()`-based, defined as tokens, not ad hoc:

```
--text-2xs  11px            metadata, legal, chart labels (never body copy)
--text-xs   12px            captions, timestamps
--text-sm   14px            secondary UI
--text-base 16px  MINIMUM   body — never smaller, no exceptions
--text-lg   18px            lead paragraphs
--text-xl   clamp(20,  2.2vw, 24)
--text-2xl  clamp(24,  3.2vw, 32)
--text-3xl  clamp(30,  4.5vw, 44)
--text-4xl  clamp(36,  6.0vw, 60)   display only
```

Line height: 1.6 body, 1.15–1.25 display. Measure: 60–75 characters. Filipino runs longer than English — test every layout with the Filipino string, which is the canonical one.

### 8.4 Iconography

Custom or heavily-curated set, ~24 icons, single stroke weight, drawn on a 24px grid, delivered as one inline SVG sprite (≤ 8 KB gzipped). **No icon font. No icon library dependency.**

Required concepts: bangka, wave/sea-state, wind, rain, anchor/pier, mangrove, fish, mangrove-crab or reef marker, health cross, rice sack (ayuda), document, seal/stamp, phone, radio, megaphone, calendar, clock, pin, download, checklist, warning triangle, evacuation, flashlight/power, offline/no-signal.

Icons never appear alone where meaning matters. Always paired with a text label. Decorative icons get `aria-hidden="true"`; meaningful ones get accessible names.

### 8.5 Photography & imagery

- Real photographs of Tumbod only. **Zero stock photography.** A stock photo of a generic tropical beach on this site is a lie about the place.
- If real photos are unavailable at launch, ship with chart-based and typographic compositions instead. This is a better outcome than fake imagery, and it is consistent with the concept.
- Treatment: minimal. Slight desaturation is acceptable for consistency; heavy filters and duotones are not. Working islands are not moodboards.
- Every photo: `alt` in Filipino describing what is shown, explicit `width`/`height`, AVIF with WebP fallback, `loading="lazy"` below the fold, `fetchpriority="high"` on at most one LCP image per route.
- People in photos require consent. Track it in `CONTENT-TODO.md`.

---

## 9. COMPLETE DESIGN SYSTEM — BUILD BEFORE ANY PAGE LAYOUT

Deliver `DESIGN-SYSTEM.md` **and** a working `/design-system` route rendering every token and component in light mode, dark mode, and at 320/360/768/1280px. This route is the source of truth and is excluded from the public sitemap.

**You may not lay out a page until this route renders.**

### 9.1 Color tokens
Per §8.2. Three-tier: primitive (`--palette-*`) → semantic (`--surface`, `--ink`, …) → component (`--btn-primary-bg`). Components reference tier 3 or 2 only.

### 9.2 Typography scale
Per §8.3. Every size, weight, line-height, and letter-spacing combination is a named token. No arbitrary values in components.

### 9.3 Spacing scale
Base 4px, non-linear at the top:
```
--space-1: 4px    --space-2: 8px    --space-3: 12px   --space-4: 16px
--space-5: 24px   --space-6: 32px   --space-7: 48px   --space-8: 64px
--space-9: 96px   --space-10: 128px
```
**Vertical rhythm rule (this is where AI-built sites break):** spacing is owned by **layout primitives** — `<Stack gap>`, `<Section>`, `<Cluster>` — never by margins on content components. A component must never set its own outer margin. Enforce with a lint rule: no `margin-top`/`margin-bottom` in component-level styles. This eliminates the specificity collisions between section-level and element-level selectors that the brief warns about.

### 9.4 Border radius
```
--radius-none: 0        hairlines, chart rules, table cells
--radius-sm: 2px        inputs, small controls
--radius-md: 4px        cards, buttons
--radius-lg: 8px        modals, sheets
--radius-full: 9999px   pills, avatars only
```
Restrained by intent — the chart concept wants precision, not softness. **But zero radius everywhere is itself a flagged anti-pattern (§35).** Use `--radius-none` for chart/table elements and `--radius-md` for touch controls; the contrast between the two is deliberate.

### 9.5 Elevation
Charts don't float. Elevation is expressed primarily by **line weight and surface value**, not drop shadows.
```
--elev-0  flat, --line hairline
--elev-1  --surface-raised + 1px --line
--elev-2  --surface-raised + 1px --line-strong
--elev-3  modal/sheet only: one soft shadow, low opacity, no colored glow
```
No more than one shadow token in the entire system. No neumorphism. No glow.

### 9.6 Motion
**One orchestrated moment, CSS only, zero animation libraries.**

The single moment: on homepage load, the chart contour lines behind the Today panel draw in — a `stroke-dashoffset` transition, staggered by depth band, ~700 ms total — and the Tumbod pin lands last. Once. Not on scroll. Not on repeat visits within the session (`sessionStorage` flag).

Everything else: functional transitions only.
```
--motion-fast: 120ms      hover, focus, press
--motion-base: 200ms      disclosure, tab change
--motion-slow: 320ms      sheet, modal
--ease-standard: cubic-bezier(0.2, 0, 0, 1)
--ease-exit:     cubic-bezier(0.4, 0, 1, 1)
```
Animate `transform` and `opacity` only. `prefers-reduced-motion: reduce` → all durations to 1 ms, the hero draw-in renders in its final state immediately, and no parallax or scroll-linked effect exists to disable. Never animate an emergency alert's appearance — it must be there.

### 9.7 Form styles
Inputs: min 44px touch height (48px preferred), 16px font (prevents iOS zoom), visible 1px border at 3:1 contrast, `--radius-sm`. Labels always visible above the field — **never placeholder-as-label**. Required fields marked with a word, not only an asterisk. Help text below the label, before the input. Errors below the input, with an icon, red, and referenced by `aria-describedby`. Error summary at the top of the form on submit, focus moved to it, each item a link to its field. Success is a page-level state with a reference number, not a toast.

### 9.8 Navigation patterns
Sticky compact header; emergency button always present; language toggle with `lang` and `hreflang` correctness; breadcrumbs below depth 1; footer as the full site index (footers are how low-literacy and screen-reader users navigate — make it a real sitemap, not four links).

### 9.9 Card patterns
Exactly **four** card variants exist. Adding a fifth requires justification in writing.
1. `AnnouncementCard` — category chip, title, date, 2-line excerpt, optional thumbnail.
2. `ServiceCard` — icon, name, fee, processing time, "Tingnan ang requirements".
3. `PersonCard` — photo, name, position, committee, term.
4. `DocumentCard` — type, number, title, one-line plain summary, format + size, download.

No generic `<Card>` with a `children` slot. Named, typed, purpose-built components only — this is what prevents page-to-page inconsistency.

### 9.10 Timeline component
Used for: project status, request tracking, ordinance history, disaster event log. Vertical on mobile, vertical on desktop too (horizontal timelines are unreadable). States: `done`, `current`, `upcoming`, `blocked`. Each node carries a date, a label, and optionally a responsible party.

### 9.11 Alert component
Four levels, distinguished by color **and** icon **and** a leading word:
`info` (Paalala) · `advisory` (Abiso) · `warning` (Babala) · `emergency` (Emergency).
Each carries an issued timestamp and, where applicable, an expiry. Dismissible only at `info` level; a dismissal is remembered per-alert-ID. `role="status"` for info/advisory, `role="alert"` for warning/emergency.

### 9.12 EmergencyBanner component
Distinct from Alert. Site-wide, top of viewport, above the header, on every page when an active emergency exists. Cannot be dismissed. Contains: level, one-sentence instruction in Filipino, issued time, and a `tel:` link. Rendered server-side so it appears without JS. Cached by the service worker so it survives loss of signal — with an explicit staleness indicator when it does.

### 9.13 ServiceRequirementChecklist component
The most important component on the site. Renders a document's requirements as an interactive checklist with `localStorage` persistence, so a resident can tick items off while gathering them over several days. Shows fee, processing time, office hours, and the responsible officer. Has a print stylesheet that produces a clean one-page list. Has a "Kopyahin ang listahan" button that copies plain text suitable for pasting into Messenger — because that is how it will actually be shared.

### 9.14 OfficialProfile component
Photo (or a dignified initials placeholder — never a grey silhouette), name with honorific, position, committee assignments, term with start/end, contact method per §4.2 Q13. Compact variant for the roster grid, full variant for the profile page. Emits `Person` JSON-LD.

### 9.15 Ordinance component
Number, date enacted, title, **plain-language one-line summary (required — an ordinance without a summary cannot be published; enforce in the CMS schema)**, status (`in force` / `amended` / `repealed`), links to amending documents, PDF download with size.

### 9.16 DocumentDownload component
Icon by type, filename, human title, format, size in KB, last-updated date, download action. Announces size before the tap, always. Long-press/right-click behaviour untouched. Files served with `Content-Disposition` and a sane filename.

### 9.17 Additional required components
`SeaConditionIndicator` · `BoatStatusRow` · `OfficeStatusBadge` (open/closed/limited, computed from office hours + holiday calendar in Asia/Manila) · `CountdownToEvent` · `LanguageToggle` · `OfflineIndicator` · `LastUpdated` · `PurokBadge` · `CategoryChip` · `Pagination` · `SearchField` · `EmptyState` · `ErrorState` · `Skeleton` (used sparingly — a fast page needs no skeleton).

### 9.18 Component contract (applies to every component)
Every component ships with: a TypeScript prop interface with no `any`; documented required vs. optional props; light + dark rendering; a defined empty state; a defined error state; a defined loading state (or an explicit note that it renders server-side and has none); keyboard operability; an accessible name; a `/design-system` entry; and a note on its byte cost if it ships client JS.

---

## 10. LAYOUT PRINCIPLES

1. **360px first.** Design and build the 360px view completely. Desktop is the adaptation. If a layout only works at 1440px, it is wrong.
2. **Chart-derived grid.** 4 columns at ≤ 480px, 8 at 481–1023px, 12 at ≥ 1024px. Gutters from the spacing scale. Max content width 1200px; measure-constrained prose at 68ch regardless of container.
3. **Asymmetry with reason.** The chart concept implies a margin column — where a real chart carries the legend, the scale bar, and hand annotations. Use it on desktop for `LastUpdated`, related links, and section markers. Do not use it for decoration.
4. **Density is respectful.** Residents are looking for information, not breathing room. Prefer more answers above the fold to more whitespace around fewer answers. This is the opposite of the default AI instinct — resist it.
5. **Section boundaries are chart contours,** drawn in CSS, not images. `--chart-contour-*` tokens.
6. **Spacing is owned by layout primitives** (§9.3). Components never set outer margins.
7. **No horizontal scroll at any width from 320px up.** Tables scroll inside their own `overflow-x: auto` container with a visible affordance; the page body never does.
8. **Landmarks are real:** one `<header>`, one `<nav aria-label>` per navigation region, one `<main id="main">`, `<aside>`, one `<footer>`. Skip link to `#main` is the first focusable element.

---

## 11. SIGNATURE ELEMENT — THE THING THIS SITE IS REMEMBERED BY

**Chosen direction: the Living Chart Header.** This combines the brief's first two options because on this island they are the same object — a chart is a travel-planning instrument.

### What it is

A compact, wide bathymetric strip at the top of the homepage — real depth contours of Outer Malampaya Sound rendered as inline SVG, with Tuluran Island rendered as actual coastline geometry and Barangay Tumbod marked with a real chart pin, not a decorative wave.

Overlaid on the chart, positioned like the annotations a navigator writes in the margin:
- **Sea condition** — word + color + icon, with the source and time it was read.
- **Next boat** — route, departure, status.
- **Wind and rain** if available.

It is a **map that is also a status bar**. It does not scroll away on mobile — it collapses on scroll into a single-line strip showing sea condition + next boat, and that strip is tappable to expand.

### Why it is right for Tumbod

- The barangay's defining fact is that it has no land border. A chart is the only honest way to depict it; a road-map header would be a category error.
- Depth contours are the reason the fishing ground exists and the reason MSPLS is protected. The visual language of the site is drawn from the thing the economy is drawn from.
- It puts the single most consequential daily fact — can I travel — in the position that a hero image would otherwise waste.
- It is structurally load-bearing: contour tokens become section dividers, the pin becomes the map marker on Contact, the chart line weight becomes the table rule weight, the annotation style becomes the `LastUpdated` treatment. Delete the chart and the whole visual system collapses — which is the test in §8.1.

### Constraints

- Inline SVG, path-simplified, **≤ 12 KB gzipped**, from real geometry per §3.2. Simplify with Douglas–Peucker at a tolerance you record; do not hand-draw fake coastline.
- No map library. No tiles. No JS to render the chart itself.
- Renders fully server-side with real geometry and last-known cached conditions. Live data hydrates in progressively. **It is useful with JavaScript disabled.**
- Reduced-motion: renders final state, no draw-in.
- Accessible: the chart is `role="img"` with a Filipino `aria-label`, and every value in it is also present as text in a visually-adjacent definition list. A screen-reader user gets the sea condition as words, not as a described picture.
- Dark mode: contour lines invert to a low-luminance chart, not a dimmed image.

### Purok wayfinding — adopted as a secondary element, not primary

The brief's third option becomes the About → Geography page and the Contact page: an interactive island map where puroks are selectable, showing population, purok leader, and evacuation site. It is **not** the primary navigation — that would fail P1 (Marilou, one bar of signal, needs a clearance requirement in two taps). Map-as-navigation is a beautiful idea that costs a resident time. It lives where exploration is the actual task.

---

## 12. HOMEPAGE BLUEPRINT — "NGAYON SA TUMBOD"

**There is no hero banner.** The first screen answers *"ano ang kailangan kong malaman ngayon?"* and nothing else. The seal is 32px in the header. There is no cover photo. There is no captain's portrait above the fold.

### 12.1 Module order (mobile, top to bottom)

| # | Module | Always visible? | Data source | Fails gracefully to |
|---|---|---|---|---|
| 0 | EmergencyBanner | only when active | CMS | absent |
| 1 | Living Chart Header (§11): sea condition, wind, next boat | yes | weather API + CMS override | last-known cached values + timestamp |
| 2 | Boat advisory strip | only when non-normal | CMS, manual | absent |
| 3 | Office status: bukas / sarado / limitado + today's hours | yes | computed from hours + holiday calendar | static hours table |
| 4 | Quick actions (4 tiles) | yes | static | static |
| 5 | Latest announcements (3) | yes | CMS | cached, with staleness note |
| 6 | Next health outreach / scheduled services | when scheduled | CMS calendar | "Walang nakatakdang schedule" |
| 7 | Emergency contacts (top 4, `tel:` links) | yes | CMS | **cached, hard requirement — must always render** |
| 8 | Popular documents & requirements (3) | yes | static | static |
| 9 | Barangay calendar — next 3 events | yes | CMS | empty state |
| 10 | Recent community projects (2, with status) | yes | CMS | empty state |
| 11 | Downloadable forms (3 most-used) | yes | static | static |
| 12 | Facebook updates, clearly labeled and dated | yes | mirror, §13.5 | "Bisitahin ang Facebook page" + link |
| 13 | Short honest introduction to the island | yes | static | static |
| 14 | Footer sitemap | yes | static | static |

### 12.2 Rationale for the order

Modules 1–3 are the "today" answer and must fit within the first viewport at 360×640 **without scrolling**. Module 4 is intent capture. 5–7 are the recurring reasons people return. 8–11 are task support. 12 acknowledges reality — Facebook is where the community currently is, and pretending otherwise loses trust. 13 is the only "about us" content on the page, and it sits at the bottom where a brochure would have put it at the top.

### 12.3 ASCII wireframe — home, 360px

```
┌──────────────────────────────────────────┐
│ [seal] BARANGAY TUMBOD    [FIL|EN] [≡]   │  sticky header
│                          ┌─────────────┐ │
│                          │ ☎ EMERGENCY │ │  always visible, red
│                          └─────────────┘ │
├──────────────────────────────────────────┤
│ ⚠ BABALA · Signal No. 2 · 4:00 PM ngayon │  EmergencyBanner (conditional)
│ Manatili sa loob. Tumawag: 0999-XXX-XXXX │
├══════════════════════════════════════════┤
│ ░░░░ LIVING CHART ░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░  ⌒⌒⌒⌒  contour  ⌒⌒⌒⌒⌒⌒⌒  ░░░░░░░░░░░ │
│ ░░   ⌒⌒⌒  ▲TUMBOD  ⌒⌒⌒   -12m ░░░░░░░░░ │  real bathymetry, inline SVG
│ ░░  ⌒⌒⌒⌒⌒⌒⌒ Tuluran I. ⌒⌒⌒⌒⌒⌒ ░░░░░░░░░ │
│ ├────────────────────────────────────────┤
│ │ DAGAT NGAYON                           │
│ │ ▓▓▓ MALAKAS ▓▓▓   alon ~2.0 m          │  color + WORD + icon
│ │ Hangin: Habagat 25 kph                 │
│ │ Basa noong 5:00 AM · PAGASA            │  provenance, always
│ ├────────────────────────────────────────┤
│ │ SUSUNOD NA BIYAHE                      │
│ │ Tumbod → Liminangcong · 6:00 AM bukas  │
│ │ ● HINDI TIYAK dahil sa alon            │
│ └────────────────────────────────────────┘
├──────────────────────────────────────────┤
│ ● SARADO ANG OPISINA · Linggo            │
│   Bubukas bukas, 8:00 AM                 │
├──────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐            │
│ │ 📄         │ │ ☎          │            │  44px+ targets
│ │ Kumuha ng  │ │ Emergency  │            │
│ │ Clearance  │ │ na numero  │            │
│ └────────────┘ └────────────┘            │
│ ┌────────────┐ ┌────────────┐            │
│ │ 🚤         │ │ 🔍         │            │
│ │ Biyahe ng  │ │ Subaybayan │            │
│ │ bangka     │ │ ang request│            │
│ └────────────┘ └────────────┘            │
├──────────────────────────────────────────┤
│ ANUNSYO            Huling update: 2 oras │
│ ┌────────────────────────────────────────┐
│ │ [AYUDA] Distribusyon ng relief goods   │
│ │ Miyerkules · Barangay Hall             │
│ ├────────────────────────────────────────┤
│ │ [KALUSUGAN] Bakuna para sa 0–5 taon    │
│ │ Biyernes · Health Station              │
│ ├────────────────────────────────────────┤
│ │ [ORDINANSA] Ord. 2025-04 · bagong ...  │
│ └────────────────────────────────────────┘
│ Lahat ng anunsyo →                        │
├──────────────────────────────────────────┤
│ SUSUNOD NA MEDICAL MISSION               │
│ Biyernes, 12 Set · 8AM–12NN              │
│ Health Station · RHU Taytay              │
│ Dalhin: ECC / health card                │
├──────────────────────────────────────────┤
│ MGA NUMERONG PANG-EMERGENCY              │
│ ☎ Barangay Hotline    0999-XXX-XXXX  →   │  tel: links, 48px rows
│ ☎ BDRRMC              0999-XXX-XXXX  →   │  ALWAYS available offline
│ ☎ Coast Guard         0999-XXX-XXXX  →   │
│ ☎ RHU Taytay          0999-XXX-XXXX  →   │
│ Buong direktoryo →                        │
├──────────────────────────────────────────┤
│ MADALAS HINGING DOKUMENTO                │
│ Barangay Clearance   ₱XX · 1 araw    →   │
│ Sertipiko ng Indigency  Libre · 1 araw → │
│ Barangay ID          ₱XX · 3 araw    →   │
├──────────────────────────────────────────┤
│ KALENDARYO                               │
│ 12 Set · Medical mission                 │
│ 15 Set · Barangay assembly               │
│ 20 Set · Clean-up ng baybayin            │
├──────────────────────────────────────────┤
│ MGA PROYEKTO                             │
│ ┌────────────────────────────────────────┐
│ │ Solar streetlights, Purok 2            │
│ │ ●───●───○  Ginagawa · 60%              │  Timeline component
│ │ ₱XXX,XXX · SB Fund 2025                │
│ └────────────────────────────────────────┘
├──────────────────────────────────────────┤
│ MGA FORM NA MADA-DOWNLOAD                │
│ ⬇ Application form  PDF · 120 KB     →   │  size stated before tap
├──────────────────────────────────────────┤
│ MULA SA FACEBOOK PAGE                    │
│ ┌────────────────────────────────────────┐
│ │ 2 araw ang nakalipas                   │
│ │ "Salamat sa lahat ng dumalo sa..."     │
│ └────────────────────────────────────────┘
│ Buksan ang Facebook page ↗                │
├──────────────────────────────────────────┤
│ TUNGKOL SA TUMBOD                        │
│ Isang barangay-isla sa Outer Malampaya   │
│ Sound. Walang kalsadang papunta rito —   │
│ bangka ang lahat ng biyahe. 1,744 ang    │
│ nakatira sa amin (PSA 2020).             │
│ Basahin ang buong kasaysayan →            │
├──────────────────────────────────────────┤
│ FOOTER — full sitemap, seal, address,    │
│ office hours, privacy, accessibility,    │
│ last-updated, contact                     │
└──────────────────────────────────────────┘
```

### 12.4 Desktop adaptation (≥ 1024px)

The chart header widens to full bleed and gains the annotation margin. Modules 4–7 arrange into a 12-column grid: quick actions and emergency contacts occupy a sticky right rail (4 cols); announcements, calendar, and projects flow in the main column (8 cols). Module order in the DOM stays identical to mobile — **desktop is achieved with grid placement, not with reordered markup**, so the reading order matches for screen readers at every width.

### 12.5 Data freshness contract

Every live module renders a `LastUpdated` line with relative + absolute time (Asia/Manila). If sea condition data is > 6 hours old, it renders with a "Maaaring luma na" warning. If > 24 hours, it renders the last-known value with an explicit "Hindi na-update" state and directs to the hotline. **Silent staleness on a disaster-adjacent module is a P0 defect.**

---

## 13. PAGE SPECIFICATIONS

For every page below, the deliverable includes: purpose, primary persona, ASCII wireframe at 360px, module list in DOM order, data dependencies, empty state, error state, offline behaviour, SEO title/description pattern, JSON-LD type, and byte budget.

### 13.1 `/ligtas` — Safety & Disaster · P1, P6 · **HIGHEST PRIORITY PAGE**
Above the fold: current threat level, one-sentence instruction, hotline block. Then: evacuation sites with capacity and the route to each (by boat where relevant), pre-typhoon checklist (interactive, persisted, printable), sea-travel advisory rules, BDRRMC roster with roles, what to do if there is no signal. **Fully precached. Must render from the service worker with zero network.** No images required to be useful.

### 13.2 `/serbisyo/[slug]` — Service detail · P1
`ServiceRequirementChecklist` first — fee, processing time, requirements, who to approach, office hours. Then: step-by-step process as a `Timeline`, legal basis with ordinance link, FAQ from §3.1F comment mining, request CTA (conditional), download links for forms. Print stylesheet required. `Service` + `GovernmentService` JSON-LD.

### 13.3 `/opisyal` — Officials · P2, P5
Roster grouped by body (Sangguniang Barangay / SK / Appointed / Lupon / Tanod / BHW / BNS), each as `OfficialProfile` compact. **No headshot marquee, no carousel.** Term dates visible. Committee assignments visible. Photos consented. `Person` JSON-LD per official; page emits `GovernmentOrganization` with `member`.

### 13.4 `/transparency` — Full Disclosure · P5
Landing lists each disclosure category with the latest posting date and an honest "wala pang na-post" where true. Sub-pages carry tables that scroll horizontally in their own container, plus a card layout below 640px. Every document: `DocumentCard` with plain-language summary. Ordinances searchable by number and keyword.

### 13.5 `/balita` — News · P1, P6
Filterable by category (taxonomy from §3.1C). Paginated, 10/page, real `<a>` pagination that works without JS. Facebook mirror clearly labeled with source and fetch time, visually distinguished, never presented as an original post.

### 13.6 `/tungkol/*` — About · P5, P2
History, geography (with the purok map from §11), MSPLS and conservation, demographics. **Demographics as readable prose with inline figures and one or two purposeful charts — not a wall of stat cards.** Every figure carries its source and year.

### 13.7 `/kontak` — Contact · P5, P6
Office hours with live status. How to physically reach Tumbod: routes, operators, duration, fare, and a plain warning about weather cancellation. Static map image (not an embedded tile map — bandwidth) with a link out to a full map, plus coordinates as selectable text. `Place` + `GeoCoordinates` JSON-LD.

### 13.8 `/offline`
The service worker fallback. Lists what *is* available offline, with links. Never a dead end. Never an apology.

---

## 14. COMPONENT LIBRARY

Per §9. Additional architectural rules:

- **Feature-based folders.** `src/features/services/`, `src/features/emergency/`, `src/features/transparency/`. Shared primitives in `src/components/ui/`. A feature may not import from another feature's internals — only from its public `index.ts`. Enforce with an ESLint boundary rule.
- **Server Components by default.** `"use client"` requires a one-line comment explaining why. Client components are leaves, never containers. A client component that wraps `{children}` is a red flag — audit it.
- **No component library dependency.** No MUI, no Chakra, no shadcn wholesale. You may read shadcn for reference and write your own; you may not ship its default look, which is precisely the SaaS default §35 forbids.
- Every component has a `/design-system` entry with all states rendered.

---

# PART III — SYSTEMS

## 15. CMS SPECIFICATION

**Selection criteria, in order:** (1) Aling Fe (§5, P3) can post from her phone in under 5 minutes; (2) no build step she must trigger; (3) content survives a platform change; (4) free or near-free at this scale; (5) role-based permissions.

**Recommended:** Payload CMS self-hosted alongside the Next.js app with Postgres, or Sanity if hosted-managed is preferred. **Not recommended:** git-based CMS (a broken commit takes the site down and Aling Fe cannot recover it); headless CMS with a developer-oriented editor.

### 15.1 Content models

```ts
Announcement    title_fil, title_en, slug, category (enum from §3.1C),
                body_fil, body_en, excerpt_fil, excerpt_en,
                publishedAt, expiresAt?, priority, image?, attachments[],
                author (ref User), status, purokScope[]?

Advisory        level (info|advisory|warning|emergency), title_fil, title_en,
                instruction_fil, instruction_en, issuedAt, expiresAt (REQUIRED),
                hotlineOverride?, affectedPuroks[]

SeaCondition    state (calm|moderate|rough|dangerous), waveHeightM?, windKph?,
                windDirection?, observedAt, source, note_fil, note_en,
                manualOverride (bool)

BoatSchedule    route, operator, departureTime, arrivalEstimate, fare?,
                status (running|uncertain|cancelled), statusNote_fil/_en,
                daysOfWeek[], updatedAt

Official        name, honorific, position (enum), body (enum), committees[],
                termStart, termEnd, photo?, photoConsent (bool, REQUIRED true
                to publish), contactPublic?, bio_fil?, bio_en?, order

Service         name_fil, name_en, slug, icon, fee, feeNote, processingTime,
                requirements[] {label_fil, label_en, note?, optional},
                steps[] {label_fil, label_en}, responsibleOfficial (ref),
                legalBasis (ref Ordinance)?, formDownloads[], acceptsOnline (bool)

Ordinance       number, type (ordinance|resolution), title_fil, title_en,
                plainSummary_fil (REQUIRED), plainSummary_en (REQUIRED),
                enactedAt, status, amends[]?, amendedBy[]?, pdf (REQUIRED)

Project         title_fil/_en, description_fil/_en, status, percentComplete,
                budget, fundSource, startedAt, targetCompletion, photos[],
                location (purok)

Disclosure      category, period, title, pdf, postedAt, summary_fil/_en

CalendarEvent   title_fil/_en, description?, startsAt, endsAt?, location,
                category, recurring?

HealthOutreach  title_fil/_en, provider, date, timeStart, timeEnd, location,
                targetGroup_fil/_en, bringItems_fil/_en, notes

EvacuationSite  name, purok, capacity, coordinates, accessNote_fil/_en,
                facilities[], contactPerson

Hotline         label_fil/_en, number, category, verifiedAt (REQUIRED),
                verifiedBy, active
```

### 15.2 Validation rules (enforced in the CMS, not in the UI)

- An `Ordinance` cannot publish without `plainSummary_fil` — an ordinance nobody can read is not disclosure.
- An `Advisory` cannot publish without `expiresAt` — this is what prevents a typhoon warning from sitting live for six months.
- An `Official` cannot publish a photo without `photoConsent = true`.
- A `Hotline` older than 90 days since `verifiedAt` shows a red badge in the admin and a "verify this number" task on the dashboard.
- Filipino fields are required; English fields are required for anything a P5 persona needs (transparency, officials, about). Announcements may publish Filipino-only with an explicit "Filipino lamang" flag.
- Image uploads are auto-converted to AVIF + WebP, resized to a defined set, and stripped of EXIF (including GPS — a geotagged photo of a resident's house is a privacy leak).

### 15.3 Publishing

Draft → Review → Published, with scheduled publish. Preview generates a shareable link that renders the real page. Publishing triggers on-demand ISR revalidation of affected routes — **no full rebuild, no deploy step.** Content changes appear within 10 seconds.

---

## 16. ADMIN DASHBOARD

Designed for a phone. Filipino UI by default. This is a product, not a config screen.

**Dashboard home:** a task list, not analytics. "3 hotline na kailangang i-verify" · "1 advisory na mag-e-expire bukas" · "2 request na naghihintay" · "Wala pang ordinansa para sa 2026." Then a large `+ Bagong Anunsyo` button.

**The 5-minute announcement flow (this is an acceptance criterion, §34):**
1. Tap `+ Bagong Anunsyo`
2. Choose category from icons
3. Type title and body (autosaves every 2s; a dropped connection loses nothing)
4. Optionally add a photo from the camera roll (auto-optimized, no settings shown)
5. Tap `I-publish ngayon` or `I-schedule`

No markdown. A minimal rich-text toolbar: bold, list, link. Nothing else. Every error message in plain Filipino with a suggested fix. Undo available for 30 seconds after publish. A version history that a non-technical person can read and restore from.

**Additional admin surfaces:** sea condition / boat status quick-update (a two-tap flow, because this gets updated daily and cannot be a form); advisory composer with a "this will appear on every page" confirmation; service request queue; hotline verification checklist; audit log viewer.

---

## 17. RESIDENT PORTAL — v2, architected for at v1

Do not build in v1. **Do** design the data model and auth boundary so it can be added without migration pain.

Planned scope: account by mobile number + OTP; request history and status; saved household profile to prefill forms; document expiry reminders; purok-targeted notifications; a resident-facing copy of their own submitted data (Data Privacy Act access right).

v1 obligations toward this: `ServiceRequest` records carry an optional `residentId` foreign key from day one; the auth boundary exists as middleware with a single admin role today; PII fields are already isolated in their own table with encryption at rest.

---

## 18. SERVICE REQUEST SYSTEM

**Conditional on §4.1 Q2.** If the barangay declines, build the requirement pages only and ship the form behind a feature flag.

### 18.1 What it is and is not
It is a **structured message that produces a reference number**. It is not automated issuance, not an e-signature, not a payment. The UI must say so plainly: *"Hindi ito awtomatikong pag-isyu. Ipapasa ang request sa Barangay Secretary. Kailangan mo pa ring pumunta sa barangay hall para kunin ang dokumento."*

### 18.2 Flow
1. Choose document → 2. Confirm the requirement checklist → 3. Fill the form (progressive, one section per screen on mobile, autosaved) → 4. Review → 5. Submit → 6. Reference number displayed large, copyable, and offered as a saved image/print.

### 18.3 Reference numbers
Format `TMB-YYYYMMDD-XXXX` where `XXXX` is a non-sequential, non-guessable code. Human-readable over the phone: avoid `0/O`, `1/I`, `5/S`. Lookup at `/serbisyo/subaybayan` requires reference number **plus** the requester's surname — never reference number alone, or the tracker becomes a PII enumeration endpoint.

### 18.4 Reliability
Submissions queue via Background Sync when offline and submit on reconnect, with clear UI state at every step: `naka-queue` → `naipadala` → `natanggap`. Rate-limited per IP and per mobile number. Honeypot + timing check + Cloudflare Turnstile (or equivalent privacy-respecting challenge) — **no reCAPTCHA**, it is a third-party tracking dependency and a bandwidth cost.

### 18.5 Notification to staff
Email plus optional SMS to the Secretary. If SMS is used, it costs money — make it configurable and rate-limited. The admin queue is the source of truth; notifications are a convenience.

---

## 19. DISASTER & EMERGENCY SYSTEM

Treated as a **separate reliability tier** from the rest of the site.

- **Precache tier 1** (must work with zero network, always): `/ligtas` and all children, the full hotline directory, evacuation sites, the pre-typhoon checklist, the BDRRMC roster. Cached on first visit, refreshed on every visit, never evicted by the cache-size policy.
- **Emergency button** in the header on every page, at every breakpoint, always. Opens a sheet with `tel:` links and the current advisory. Works offline. Keyboard-reachable as one of the first tab stops after the skip link.
- **Advisory levels** map to §9.11. An active `warning` or `emergency` renders `EmergencyBanner` site-wide, server-side.
- **Staleness safety:** a cached advisory displayed offline shows the issue time and an explicit "Baka may bago nang abiso — tumawag sa hotline." Never present a cached advisory as current.
- **Degraded mode:** if the CMS is unreachable at build or request time, `/ligtas` renders from a checked-in static JSON fallback. This page has no single point of failure.
- **Print:** `/ligtas` has a print stylesheet producing a one-page sheet suitable for posting at the barangay hall and on every purok bulletin board. Assume it will be photocopied in black and white — the design must survive that.
- **Testing:** a documented quarterly drill where staff publish a test advisory to a staging environment and verify it appears offline on a real phone.

---

## 20. TRANSPARENCY PORTAL

Full Disclosure Policy compliance is the legal floor; readability is the goal.

- Every posted document gets a plain-language one-line summary. Enforced in the schema (§15.2).
- Budget presented as: the number, what it is for, and a simple proportional visualization — not a pie chart with twelve slices. Accessible: the chart's data is also a table.
- Project status via `Timeline` with percent complete, budget, and fund source.
- Ordinances searchable by number and keyword; filterable by status; each with amendment history.
- An honest "Hindi pa na-po-post" state with the reason and the expected date, rather than an empty table that implies non-compliance where there is only a delay.
- Every PDF: text-searchable if possible, sanely named, size declared, and accompanied by an HTML summary so the content is indexable and readable without downloading.

---

# PART IV — QUALITY REQUIREMENTS

## 21. ACCESSIBILITY — WCAG 2.2 AA, NON-NEGOTIABLE

Target: **WCAG 2.2 Level AA**, with the 2.2 additions explicitly handled.

**Baseline:** semantic HTML first; ARIA only where HTML cannot express it. One `<h1>` per page. No heading level skipped. Real landmarks. Skip link first in tab order.

**Contrast:** 4.5:1 body text, 3:1 large text and meaningful non-text, in **both** light and dark modes. Verify programmatically in CI, not by eye.

**Keyboard:** everything operable. Visible focus with a 2px `--focus-ring` at 3:1 against both the component and its background (WCAG 2.2 **2.4.11 Focus Not Obscured** and **2.4.13 Focus Appearance**). No keyboard traps. Logical tab order matching visual order at every breakpoint. The sticky header must not obscure a focused element — apply `scroll-padding-top`.

**WCAG 2.2 specifics:**
- **2.4.11 Focus Not Obscured (Minimum)** — sticky header and any sheet must never fully hide the focused element.
- **2.5.7 Dragging Movements** — nothing on this site requires dragging; the purok map is tap/click and keyboard-selectable.
- **2.5.8 Target Size (Minimum)** — 24×24 CSS px absolute minimum; **this project mandates 44×44**, with 48px on emergency and primary actions.
- **3.2.6 Consistent Help** — the emergency/contact affordance appears in the same relative position on every page.
- **3.3.7 Redundant Entry** — the request form never asks for the same information twice; multi-step forms carry values forward.
- **3.3.8 Accessible Authentication (Minimum)** — the admin login supports password managers, permits paste, and uses no cognitive-function test.

**Screen readers:** tested with NVDA/Firefox, VoiceOver/Safari-iOS, and TalkBack/Chrome-Android. TalkBack is the one that matters most here — it is what a resident would actually use.

**Language:** `lang` correct on `<html>` and on any inline foreign-language span. Filipino content must be announced in Filipino. `hreflang` on alternates.

**Motion:** `prefers-reduced-motion` fully respected per §9.6. No auto-playing anything. No parallax. Nothing that flashes more than 3×/second (there is nothing that flashes at all).

**Forms:** per §9.7. Every input labelled. Errors programmatically associated. Error summary on submit with focus management.

**Testing gates:** `axe-core` in CI on every route, zero violations. Manual keyboard walkthrough of every page documented. Lighthouse a11y = 100. Zero-violation is a merge blocker, not a warning.

---

## 22. PERFORMANCE BUDGETS

Budgets are enforced in CI. **A PR that exceeds a budget fails.** Every new feature must state its byte cost in the PR description.

### 22.1 Route budgets (transferred, gzip/brotli, cold cache)

| Route | HTML | CSS | JS | Fonts | Images | **Total** |
|---|---|---|---|---|---|---|
| `/` | 30 KB | 14 KB | 40 KB | 60 KB | 40 KB | **≤ 150 KB** |
| `/ligtas` | 20 KB | 14 KB | 20 KB | (cached) | 0 KB | **≤ 60 KB** |
| `/serbisyo/[slug]` | 18 KB | 14 KB | 25 KB | (cached) | 10 KB | **≤ 70 KB** |
| `/balita/[slug]` | 20 KB | 14 KB | 20 KB | (cached) | 60 KB | **≤ 120 KB** |
| Any route | — | — | — | — | — | **≤ 200 KB hard ceiling** |

### 22.2 Timing budgets — Moto G Power class device, simulated Slow 4G

| Metric | Budget |
|---|---|
| LCP | ≤ 2.5 s (target 2.0) |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| TTFB | ≤ 600 ms |
| TBT | ≤ 200 ms |
| Lighthouse Perf / A11y / BP / SEO | ≥ 95 / 100 / ≥ 95 / ≥ 95 |

### 22.3 Rules

- **Zero third-party requests on public routes.** No CDN fonts, no analytics script from another origin, no embedded map tiles, no Facebook SDK, no YouTube iframe. Facebook content is mirrored server-side (§13.5), never iframed.
- **Total JS shipped to the client on `/` ≤ 40 KB.** Achieved by Server Components and near-zero client interactivity. If a module needs client JS, justify it in writing.
- Fonts: WOFF2, subset, ≤ 100 KB total across all faces, preload one file only, `size-adjust` fallback to eliminate layout shift.
- Images: AVIF with WebP fallback, `srcset` + `sizes`, explicit dimensions, `loading="lazy"` below fold, exactly one `fetchpriority="high"` per route.
- CSS: single file, critical inlined if it beats the round trip, unused rules purged, no CSS-in-JS runtime.
- No polyfills for browsers below the support matrix (§22.4).
- Bundle analysis on every PR, diffed against `main`, posted as a comment.

### 22.4 Browser support
Chrome/Android WebView ≥ 100, Safari iOS ≥ 15, Firefox ≥ 100. Below that: content must still be readable and navigable without JS (progressive enhancement, §25).

---

## 23. PWA & OFFLINE REQUIREMENTS

The site must be **installable** and **genuinely useful with no connection**. This is not a checkbox — the island loses signal.

### 23.1 Caching strategy by tier

| Tier | Content | Strategy | Eviction |
|---|---|---|---|
| **1 — Critical** | `/ligtas/*`, hotlines, evacuation sites, checklist, BDRRMC, `/offline`, app shell, fonts, CSS, icon sprite | Precache on install, **stale-while-revalidate**, refresh on every visit | Never |
| **2 — Important** | `/`, `/serbisyo/*`, `/opisyal`, `/kontak` | Stale-while-revalidate | LRU, keep ≥ 20 |
| **3 — Nice** | `/balita/*`, `/transparency/*`, images | Network-first, cache fallback | LRU, 50 entries / 20 MB |
| **4 — Never** | Admin, API mutations, request tracker | Network only | — |

### 23.2 Behaviour

- **Offline indicator:** a persistent, non-alarming band — *"Naka-offline. Ipinapakita ang huling nakuha noong [time]."* Not a modal. Not an error page.
- **Every cached page** shows its cache timestamp. A resident must never mistake a cached advisory for a live one.
- **Background Sync** for service requests: queued submissions survive a closed tab and submit on reconnect, with a notification when they succeed.
- **Update flow:** when a new service worker is available, show a quiet "May bagong bersyon — i-refresh" prompt. Never force-reload mid-task.
- **Install prompt:** offered contextually after a second visit, in Filipino, explaining the benefit ("para gumana kahit walang signal"), never as an immediate popup.
- **Manifest:** name, short name, Filipino description, maskable icons at all required sizes, `display: standalone`, theme color matching the header, `start_url: "/?src=pwa"`, shortcuts to `/ligtas` and `/serbisyo`.
- **Storage:** stay under 25 MB total. Report usage in a debug view.
- **Testing:** an automated test that loads the site, goes offline via CDP, and asserts `/ligtas` and the hotline list still render with correct content. This test is a merge blocker.

---

## 24. SECURITY REQUIREMENTS

- **Headers** (verify in CI with a real request): `Content-Security-Policy` with no `unsafe-inline` for scripts (use nonces), `Strict-Transport-Security` with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geolocation by default, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`.
- **Auth:** admin behind session auth with secure, `HttpOnly`, `SameSite=Lax` cookies. Argon2id password hashing. Mandatory TOTP 2FA for the admin role. Session timeout 8 hours, absolute max 30 days with re-auth for sensitive actions.
- **RBAC** — three roles, enforced server-side on every mutation, never in the UI alone:

| Role | Can |
|---|---|
| **Secretary** | Create/edit/publish announcements, events, health outreach; update sea condition and boat status; manage service requests; upload documents. **Cannot** edit officials, ordinances, budget, or users. |
| **Punong Barangay** | Everything Secretary can, plus publish advisories at `warning`/`emergency` level, edit officials, publish ordinances and disclosures, approve/reject content in review. |
| **Administrator** | Everything, plus user management, role assignment, system settings, audit log export. Technical custodian role, held by whoever maintains the site. |

- **Audit logging:** every create/update/delete/publish/login/role-change is logged with actor, timestamp, entity, and a before/after diff. Immutable (append-only), retained 3 years, exportable. This is what makes the transparency claim credible.
- **Input:** validate every input server-side with Zod at the boundary. Parameterized queries only. Sanitize all rich text (allowlist, not denylist) before storage and again at render.
- **Uploads:** magic-byte type validation, size limits, EXIF/GPS stripped, served from a separate origin or with `Content-Disposition: attachment` for non-images, filenames regenerated.
- **Rate limiting:** on login (with exponential backoff and lockout), on service requests, on the tracker lookup, on search.
- **Privacy (RA 10173, Data Privacy Act):** a real privacy notice in Filipino and English; data minimization in the request form (do not collect what the Secretary does not need); a stated retention period; a documented process for access and deletion requests; a named DPO per §4.2 Q14; consent tracked for published photos.
- **Secrets:** environment variables only, never committed. `.env.example` documents every variable with a comment. Rotate on handover.
- **Dependencies:** `npm audit` in CI as a blocker for high/critical. Dependabot or Renovate. Minimal dependency count is itself a security posture — every package added must be justified in the PR.

---

# PART V — ENGINEERING

## 25. TECHNICAL ARCHITECTURE

**Stack:** Next.js (App Router) + TypeScript strict + Tailwind CSS with the design tokens as the *only* theme source + Postgres + Payload CMS. Deploy on Vercel; Postgres on Neon or Supabase.

**Rendering:** static-first. Every public page is statically generated. Dynamic data (sea condition, boat status, advisories) uses on-demand ISR with a short revalidation window and CMS-triggered invalidation. Nothing on a public route is client-side fetched on first paint.

**Progressive enhancement — mandatory:**
- Every page renders complete and readable with JavaScript disabled.
- Navigation works as plain links.
- The service request form works as a native `<form>` POST to a server action; JS upgrades it to autosave and background sync.
- Search degrades to a server-rendered results page.
- The language toggle is a link to the other URL, not a JS state change.
- **Test this.** A CI job loads every route with JS disabled and asserts the primary content is present.

**Folder structure:**
```
src/
  app/                      routes only, thin — no business logic
    (public)/
    (admin)/
    api/
  features/
    emergency/              components/ lib/ types.ts index.ts
    services/
    news/
    transparency/
    officials/
    chart/                  the signature element
  components/ui/            design-system primitives only
  lib/
    tokens/                 the single source of design tokens
    cms/
    db/
    i18n/
    validation/             Zod schemas shared client+server
    utils/
  content/                  static fallbacks (incl. the /ligtas JSON)
  styles/
tests/
  e2e/  a11y/  perf/  offline/
docs/
```

**Cross-cutting rules:** no business logic in route files; no direct DB access outside `lib/db`; Zod schemas defined once and shared; all dates handled in Asia/Manila with explicit timezone, never `new Date()` on rendered output without a formatter.

## 26. DATABASE DESIGN

Postgres. Tables mirror §15.1. Additional requirements:

- `service_requests` — PII (`full_name`, `address`, `contact_number`, `purpose`) isolated in a separate table `service_request_pii` with a FK, encrypted at rest, and a retention policy that purges after the period stated in the privacy notice.
- `audit_log` — append-only, no `UPDATE` or `DELETE` grants for the application role; `actor_id`, `action`, `entity_type`, `entity_id`, `diff jsonb`, `ip`, `created_at`.
- Bilingual fields as sibling columns (`title_fil`, `title_en`), not a JSON blob — they must be independently indexable and validatable.
- Indexes on every slug, every `published_at`, every foreign key, and a GIN index on the ordinance search vector.
- Soft deletes (`deleted_at`) on all content; hard deletes only via an admin action that writes to the audit log.
- Migrations are versioned, reversible, checked in, and run in CI against a scratch database before merge.
- Automated daily backup with a **documented and actually-performed restore test** before launch.

## 27. API SPECIFICATIONS

REST under `/api/v1/`. Public GETs are cacheable and unauthenticated; all mutations authenticated and rate-limited.

```
GET  /api/v1/conditions          sea condition + boat status + office status
GET  /api/v1/advisories/active
GET  /api/v1/announcements?category=&page=
GET  /api/v1/services
GET  /api/v1/officials
GET  /api/v1/hotlines
POST /api/v1/requests            create service request  (rate-limited)
GET  /api/v1/requests/track      ref + surname required  (rate-limited)
POST /api/v1/revalidate          CMS webhook, signed
```

Every endpoint: Zod-validated input and output, typed response, RFC 9457 problem-details errors, explicit cache headers, and an OpenAPI document generated from the schemas. Response bodies stay small — this API is consumed over 2G.

## 28. SEO & STRUCTURED DATA

- Per-route `title` and `description`, Filipino canonical with `hreflang` alternates (`fil` default, `en`, `x-default` → `fil`).
- Open Graph and Twitter cards; OG images generated at build via `next/og` from the chart motif and the page title — **not photographs**, so they stay small and never misrepresent.
- `sitemap.xml` generated from the route manifest, including both language trees. `robots.txt` allowing all public routes, disallowing `/admin` and `/api`.
- JSON-LD: `GovernmentOrganization` (site-wide, with `parentOrganization` → Municipality of Taytay), `LocalGovernmentOffice` with address, `geo`, `openingHoursSpecification`; `Person` per official; `GovernmentService` per service; `NewsArticle` per announcement; `Event` per calendar item; `BreadcrumbList` on every nested page; `Place` + `GeoCoordinates` on Contact. Validate all of it against Schema.org and Google's Rich Results Test in CI.
- Semantic HTML and real heading hierarchy do most of the SEO work here. Target queries: "barangay tumbod", "barangay clearance taytay palawan", "tumbod taytay palawan", "malampaya sound barangay", plus each official's name.

## 29. ANALYTICS

Privacy-first, cookieless, self-hosted or first-party-proxied (Plausible or Umami). **Zero third-party requests** (§22.3) — proxy through your own domain. No personal data. Disclosed in the privacy notice.

Track only what changes decisions: which routes are used, which services are viewed most, emergency button taps, offline sessions, install rate, service request completion vs. abandonment, and Core Web Vitals from real users (`web-vitals` → your own endpoint, ≤ 2 KB). Review quarterly with the barangay in plain language.

## 30. DEPLOYMENT

- **Environments:** production, staging (identical, with seeded content and password protection), preview per PR.
- **Domain:** per §4.1 Q5. If `.gov.ph`, start that process immediately — it is the long pole. Ship on a fallback domain with a redirect plan.
- **DNS/TLS:** HSTS preload, TLS 1.3, automatic renewal.
- **Uptime monitoring** with alerts to the technical custodian, plus a public status expectation documented in the README.
- **Handover:** a written runbook covering credentials, renewal dates, cost, who to call, and how to restore from backup. Named custodian with a named successor. **A public site with no maintenance plan is a liability, not an asset** — this document is a deliverable, not an afterthought.

## 31. CI/CD

Every PR must pass, as blockers:
1. TypeScript `--strict`, zero errors
2. ESLint + Prettier, zero warnings (including the custom boundary and no-raw-color rules)
3. Unit tests, ≥ 80% coverage on `lib/`
4. Playwright E2E on the critical paths (§33)
5. `axe-core` on every route, **zero violations**
6. Lighthouse CI against §22 budgets
7. Bundle size check against §22.1, with a diff comment
8. Offline test (§23.2)
9. No-JS render test (§25)
10. Placeholder check (§0.2) on production builds
11. `npm audit` — no high/critical
12. Migration dry-run against a scratch DB
13. Link check — no internal 404s

Conventional commits. Squash merge. Automatic preview deploy with the URL commented on the PR.

## 32. CODING STANDARDS

- **TypeScript strict**, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. **`any` is banned**; `unknown` + narrowing instead. No non-null assertions except with a comment justifying each.
- **Server Components by default.** `"use client"` requires a justifying comment.
- **Design tokens only.** A raw hex, a raw px value for spacing, or an arbitrary Tailwind value in a component is a lint error. Write the ESLint rule.
- **No component sets its own outer margin** (§9.3). Lint rule.
- **Feature boundaries** enforced by lint (§14).
- Named exports only, except for Next.js-required default exports.
- Every exported function and component has a TSDoc comment stating what it does and any non-obvious constraint.
- No dead code, no commented-out code, no `console.log` in committed code, no `TODO` without an owner and an issue link.
- Filipino user-facing strings live in `lib/i18n/`, never inline. English mirrors them. A missing translation key is a build error.
- Match the surrounding code's conventions. Consistency beats personal preference.

## 33. TESTING STRATEGY

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | date/timezone logic, office-status computation, reference-number generation, validation schemas, i18n resolution |
| Component | Testing Library | every component's states; keyboard operability; accessible names |
| Integration | Vitest + test DB | CMS publish → ISR revalidate; request submission → audit log; RBAC enforcement per role |
| E2E | Playwright | the critical paths below |
| A11y | axe-core + manual | every route automated; manual keyboard + screen reader per release |
| Performance | Lighthouse CI | every route against §22 |
| Offline | Playwright + CDP | `/ligtas` and hotlines render with network disabled |
| No-JS | Playwright | every route renders primary content with JS disabled |
| Visual | Playwright screenshots | design-system route, light + dark, 4 widths |

**Critical E2E paths (must never break):**
1. Home loads and shows sea condition, office status, and emergency contacts.
2. Emergency button reachable and functional from every page type.
3. `/ligtas` renders fully offline with correct hotline numbers.
4. A resident finds barangay clearance requirements in ≤ 2 taps from home.
5. A service request submits and returns a trackable reference number.
6. A tracker lookup requires both reference and surname.
7. The Secretary publishes an announcement and it appears on the homepage within 10 seconds.
8. Language toggle preserves the current page and persists.
9. RBAC: a Secretary account cannot publish an emergency advisory or edit officials.
10. An expired advisory disappears from the banner automatically.

---

# PART VI — GOVERNANCE

## 34. ACCEPTANCE CRITERIA

The build is complete only when **every** item is verified and evidenced.

**Performance** — [ ] every route within §22.1 · [ ] LCP ≤ 2.5 s on throttled Slow 4G, measured · [ ] Lighthouse ≥ 95/100/95/95 · [ ] zero third-party requests on public routes · [ ] font payload ≤ 100 KB.

**Accessibility** — [ ] zero axe violations on every route · [ ] full keyboard walkthrough documented · [ ] TalkBack pass on home, `/ligtas`, one service page · [ ] AA contrast verified in light and dark · [ ] all WCAG 2.2 additions in §21 handled · [ ] reduced-motion honored.

**Offline** — [ ] `/ligtas` + hotlines render with network fully disabled · [ ] cached content shows its timestamp · [ ] offline indicator present and calm · [ ] background sync verified end to end · [ ] installable with correct manifest and maskable icons.

**Content & language** — [ ] Filipino default and complete · [ ] English complete on every public route · [ ] no partial-language pages · [ ] every placeholder registered in `CONTENT-TODO.md` and visibly marked · [ ] no invented facts, numbers, names, or phone numbers · [ ] every statistic carries a source and year.

**Function** — [ ] all 10 critical E2E paths pass · [ ] Secretary publishes an announcement from a phone in under 5 minutes, timed with a real person or a recorded walkthrough · [ ] RBAC enforced server-side and verified per role · [ ] audit log captures every mutation.

**Security** — [ ] all headers present, verified by request · [ ] 2FA enforced on admin · [ ] no secrets committed · [ ] `npm audit` clean at high/critical · [ ] privacy notice published in both languages · [ ] EXIF stripped on upload.

**Design** — [ ] the signature element is structurally load-bearing, not decorative · [ ] no anti-pattern from §35 present · [ ] every color traces to a documented source · [ ] `/design-system` route renders every component in every state, both themes, four widths · [ ] design-plan self-critique (§34.1) completed and documented.

**Handover** — [ ] `README.md` per §37 · [ ] `CONTENT-TODO.md` complete · [ ] 5-step announcement guide, written for a non-technical reader in Filipino · [ ] restore-from-backup tested and documented · [ ] named custodian and successor.

## 34.1 AI SELF-REVIEW — MANDATORY, TWICE

**Round 1 — after the design plan, before implementation.** Do not present the design plan as final until you have critiqued it and revised. Answer each in writing:

1. Could this design be for any other barangay in the Philippines? If yes, it fails — name what makes it Tumbod's and strengthen it.
2. Does the signature element encode something *true*, or is it a texture? If I deleted it, would anything break?
3. Does my palette match any of these forbidden defaults: cream `#F4F1EA` + high-contrast serif + terracotta; near-black + one acid-green accent; navy + gold "government blue"; blue→purple gradient; corporate teal? If yes, redo it.
4. Is my layout a broadsheet with hairline rules and zero border radius? A hero with a giant number, three stat cards, and a gradient? A Bootstrap card grid? If yes, redo it.
5. Am I reproducing an LGU template — seal on a blue gradient banner, headshot marquee, ribbon-cutting carousel? If yes, redo it.
6. Am I reproducing a SaaS template — centered hero, three feature cards with outline icons, gradient CTA band, testimonial row, pastel illustration? If yes, redo it.
7. Does the first screen answer "what do I need to know today?" without scrolling at 360×640? Prove it with the wireframe.
8. Does every homepage module serve a named persona from §5? List each module → persona. Delete the orphans.
9. Can Marilou (P1) get a clearance requirement in two taps, under 150 KB, in Filipino?
10. Can Aling Fe (P3) post an announcement from her phone in five minutes?
11. Is anything on `/ligtas` dependent on a network request, a third party, or JavaScript?
12. Is any number, name, or phone number in my plan invented? Name every one and convert it to a flagged placeholder.
13. Have I chosen density where a default aesthetic would have chosen whitespace?
14. Does the design still work in black-and-white photocopy (for `/ligtas` print) and at 200% browser zoom?

**Round 2 — after implementation, before declaring done.** Re-run 1–14 against the built site, plus:

15. Measure the real transferred bytes per route. Paste the numbers. Do they meet §22.1?
16. Run axe on every route. Paste the output.
17. Disable the network and load `/ligtas`. Screenshot it.
18. Disable JavaScript and load every route. Which ones break?
19. List every `any`, every `@ts-ignore`, every `eslint-disable`. Justify or remove each.
20. List every component that sets its own outer margin. Fix them.
21. List every raw hex and every arbitrary spacing value in components. Fix them.
22. Where did I ship prototype-quality code — missing error states, unhandled loading, no empty state, untested edge case? Fix, don't note.
23. What did I leave incomplete or assume? State it plainly in the final report. Do not round up to "done."

**Report both rounds in full.** A self-review that finds nothing is not a passing self-review; it is an incomplete one.

## 35. "NEVER BUILD THIS" — ANTI-PATTERNS

### Visual
- Hero banner with a background photo and centered overlaid text.
- The barangay seal enlarged on a blue or blue-purple gradient.
- Carousel of anything. Ribbon-cutting photos especially.
- Marquee or auto-scrolling row of officials' headshots.
- A "Message from the Punong Barangay" occupying the first screen.
- Three-column feature-card grid with outline icons and rounded corners.
- Stat-card wall: four big numbers with labels and no context.
- Gradient CTA band with a rounded pill button.
- Pastel corporate illustrations. Undraw-style figures. Any stock photography.
- Decorative wave SVG dividers. (The chart contours are geographic data, not this.)
- Glassmorphism, neumorphism, colored glow shadows, animated gradient meshes.
- Dark mode implemented as a CSS filter inversion.
- Body text below 16px. Thin or light weights for body copy.
- Cream `#F4F1EA` + high-contrast serif + terracotta accent.
- Near-black + a single acid-green accent.
- Broadsheet grid, hairline rules, zero radius everywhere as the entire idea.

### UX
- Requirements published only as a PDF.
- Emergency information in the footer.
- An emergency FAB that covers content.
- Any modal on page load. Cookie banners. Newsletter popups.
- Infinite scroll on announcements.
- Accordions that hide the answer rather than the detail.
- A splash screen or intro animation.
- Auto-playing video or audio.
- Placeholder-as-label form fields.
- A "coming soon" page that is the actual delivered state of a section.
- Fake live data, fake tide charts, fake weather, fake anything.
- Language toggle that resets to the homepage.
- Search that cannot find "clearance."

### Technical
- Any third-party script on a public route.
- Facebook SDK, embedded posts, or an iframe of the page.
- Embedded tile map on a bandwidth-budgeted page.
- Client-side data fetching for above-the-fold content.
- A component library's default theme shipped as-is.
- Animation libraries (Framer Motion, GSAP, Lottie) for what CSS can do.
- Icon fonts.
- `any` in TypeScript.
- Business logic in route files.
- Content editable only by editing code or committing to git.
- A build step the Barangay Secretary must trigger.
- Storing PII in the same table as public content.
- Client-side-only permission checks.
- Prototype code shipped as production: missing error states, no empty states, unhandled failures, untested paths.

### Content
- Civic boilerplate: "Welcome to the official website of…", "We are committed to serving…", "Together we build a better community."
- `Submit`, `Click here`, `Learn more`, `Read more` as button labels.
- Lorem ipsum anywhere, at any stage.
- Invented officials, numbers, fees, schedules, or hotlines.
- An empty transparency table with no explanation.
- Untranslated English fragments inside Filipino pages.
- Apologetic error states with no next action.

## 36. DEVELOPMENT WORKFLOW — THE ORDER IS THE REQUIREMENT

| Phase | Deliverable | Gate |
|---|---|---|
| 1. Discovery & research | `RESEARCH.md`, `DISCOVERY-QUESTIONS.md` | **GATE 1** — human answers §4.1 |
| 2. Information architecture | `IA.md`: sitemap, URL map, nav model, search scope | review |
| 3. Branding extraction | `BRAND-EXTRACTION.md`: palette table with sources, voice samples, asset inventory | review |
| 4. UX strategy | `UX-STRATEGY.md`: personas → journeys → module map, with each homepage module traced to a persona | review |
| 5. Design system | `DESIGN-SYSTEM.md` + working `/design-system` route | must render before phase 6 |
| 6. Wireframes | ASCII + rendered static wireframes, all pages, 360/768/1280 | review |
| 7. Component library | Every component built, all states, in `/design-system` | must complete before phase 9 |
| 8. Technical architecture | `ARCHITECTURE.md`: folders, data model, API, ISR strategy, SW strategy | review |
| — | **Design self-critique, Round 1 (§34.1)** | **GATE 2 — human approval** |
| 9. Accessibility plan | `A11Y-PLAN.md`: per-component keyboard and SR behaviour, focus order | — |
| 10. Performance plan | `PERF-PLAN.md`: per-route byte allocation before any code is written | — |
| 11. Implementation | The site, feature by feature, each within its byte budget | CI blockers per §31 |
| 12. Self-review Round 2 | Full §34.1 report with measurements pasted | **GATE 3** |
| 13. Final optimization | Budget compliance, a11y zero-violations, offline verified, handover docs | ship |

Phases 1–8 produce **markdown and one static design-system route only.** No application code.

## 37. FINAL DELIVERABLES

1. `RESEARCH.md` — §3, with citations and retrieval dates
2. `DISCOVERY-QUESTIONS.md` — §4, blocking vs. non-blocking
3. `BRAND-EXTRACTION.md` — §3.1
4. `IA.md` — §6
5. `UX-STRATEGY.md` — §7 + §5
6. `DESIGN-PLAN.md` — §8, §10, §11, §12, with Round 1 self-critique appended
7. `DESIGN-SYSTEM.md` + live `/design-system` route — §9
8. `ARCHITECTURE.md` — §25–§27
9. `A11Y-PLAN.md` — §21
10. `PERF-PLAN.md` — §22
11. The implemented site — §13–§20
12. `CONTENT-TODO.md` — §38
13. `README.md` — §39
14. `RUNBOOK.md` — §30 handover
15. `SELF-REVIEW.md` — both rounds of §34.1, with measurements
16. `PRIVACY.md` + the published privacy notice, both languages

## 38. `CONTENT-TODO.md` REQUIREMENTS

Grouped by page, then by field. Every row:

| Page | Field | Placeholder used | What's needed | Who provides it | Blocking? | Status |
|---|---|---|---|---|---|---|

Plus a top section: **"Do not launch without these"** — officials roster with consent, verified emergency hotlines, office hours, fee schedule, evacuation site list, boat route reality, and the seal asset. Everything on that list is launch-blocking, and the document says so explicitly.

## 39. `README.md` REQUIREMENTS

Two audiences, clearly separated.

**Part A — For barangay staff (Filipino first, English below):**
- **Paano mag-post ng anunsyo — 5 hakbang.** With screenshots. Written for someone who has never used a CMS.
- How to update sea condition and boat status (the daily task).
- How to post an advisory during a typhoon, and how to take it down.
- How to answer a service request.
- How to add an ordinance.
- Who to call when something breaks — a name and a number, not an email address into the void.

**Part B — For developers:**
- Prerequisites, install, environment variables (every one documented in `.env.example`), local dev, seeding.
- Architecture overview and where things live.
- The design token system and how to change a color correctly.
- How to add a page, a content type, a component.
- Performance and accessibility budgets, and how to check them locally.
- Deployment, migrations, rollback.
- Test suites and how to run each.
- Known limitations and the v2 roadmap (§17).

---

## APPENDIX — VERIFIED / UNVERIFIED FACT REGISTER

Maintain this in `RESEARCH.md`, updated as facts are confirmed.

| Fact | Value as given | Status | Source | Retrieved |
|---|---|---|---|---|
| Location | Tuluran Island, Outer Malampaya Sound, Taytay, Palawan | unverified | brief | — |
| Coordinates | ~10.9856°N, 119.2773°E | unverified | brief | — |
| Population 2020 | 1,744 (2.09% of Taytay) | unverified | brief / PSA | — |
| Population 2015 | 1,489 across 273 households | unverified | brief / PSA | — |
| Largest age band 2015 | 5–9 years | unverified | brief / PSA | — |
| Barangays in Taytay | 31 | unverified | brief | — |
| No land border | true | unverified | brief | — |
| Inside MSPLS | true | unverified | brief / DENR-PCSD | — |
| People's organization | Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod | unverified | brief | — |
| Region | MIMAROPA | unverified | brief | — |
| Facebook page | facebook.com/profile.php?id=61579831854802 | unverified | brief | — |
| Officials roster | — | **MISSING — blocking** | barangay | — |
| Emergency hotlines | — | **MISSING — blocking** | barangay | — |
| Boat routes / fares | — | **MISSING — blocking** | barangay | — |
| Fee schedule | — | **MISSING — blocking** | barangay | — |
| Purok names / count | — | **MISSING** | barangay | — |
| Evacuation sites | — | **MISSING — blocking** | BDRRMC | — |
| Office hours | — | **MISSING** | barangay | — |
| Seal / logo asset | — | **MISSING** | barangay | — |
| Connectivity on island | — | **MISSING** | field/carrier | — |
| Bathymetry source | — | **MISSING** | NAMRIA / GEBCO | — |

---

**END OF SPECIFICATION**

The agent receiving this document begins at §36 Phase 1. It does not write application code until GATE 2 is approved by a human.
