# CONTENT-TODO.md

**Spec reference:** BUILD-PROMPT.md §38
**Status as of 2026-08-04:** the site builds and every unknown is a visible, machine-detectable placeholder. `npm run check:placeholders` fails a production build while any launch-blocking item remains.

---

## 🔴 DO NOT LAUNCH WITHOUT THESE

Everything in this section is launch-blocking. The site can be previewed with `PUBLIC_ALLOW_PLACEHOLDERS=true`, but it must not go public until these are filled.

> **Two items came off this list on 2026-08-05:** the elected 2023–2026 officials roster, and the barangay's own two hotline numbers (`0927-978-7629`, `0928-284-0826`). Provenance and what is still missing: `FINDINGS-2026-08-05.md`.

| # | What's needed | Who provides it | Why blocking |
|---|---|---|---|
| 1 | **Emergency hotline numbers** — barangay, BDRRMC, Coast Guard N. Palawan, RHU Taytay, MDRRMO, PNP | Secretary + BDRRMC | `/ligtas` is the highest-priority page. A wrong or absent number during a typhoon is the worst failure this project can produce. |
| 2 | **Officials roster + written photo consent** | Secretary | Officials page cannot render. Consent is a legal requirement, not a preference. |
| 3 | **Evacuation sites** — name, purok, capacity, how to reach in bad weather, who holds the key | BDRRMC | A typhoon made landfall in this municipality in Nov 2025 with >3 m surge. |
| 4 | **Boat routes** — destination, operator, departure, fare; and **who announces a cancellation** | Barangay + boat operators | The signature element's boat row. |
| 5 | **Fee schedule + enabling ordinance** for all 6 documents | Treasurer / Secretary | Every service page. |
| 6 | **Office hours** (and whether they change during habagat) | Secretary | Office-status badge computes from this. |
| 7 | **Barangay hall address** | Secretary | Footer, contact, JSON-LD. |
| 8 | **Seal / logo asset** (vector preferred) | Barangay | Header shows a placeholder monogram. |
| 9 | **Real island coastline geometry** from OpenStreetMap | Developer task — see `src/features/chart/geometry.ts` | The chart currently ships a *declared schematic*. §3.2 forbids passing off invented coastline as real. |
| 10 | **Filipino copy review by the Barangay Secretary** | Secretary | All strings in `src/lib/i18n/fil.ts` were written from general barangay register, not Tumbod's own voice, because the Facebook extraction is blocked. |

---

## 🟠 BLOCKED UPSTREAM

| # | What | Blocker |
|---|---|---|
| 11 | Colour palette re-derivation from real Tumbod photographs | `FACEBOOK-EXTRACTION-WORKSHEET.md` unfilled (question B1). Current palette is sourced from documented physical referents — the declared Part D fallback. Tokens are semantic, so this is a values change in one file. |
| 12 | Homepage module order confirmation | Needs the Facebook content taxonomy. Order is currently provisional. |
| 13 | Service-page FAQ | Was to be mined from Facebook comments. |
| 14 | Facebook mirror on the homepage | Needs a server-side fetch strategy; the page is not machine-readable. |

---

## 🟡 NEEDED, NOT BLOCKING

| # | What | Who | Assumption if absent |
|---|---|---|---|
| 15 | Purok names and count | Secretary | `Purok 1…N`, flagged |
| 16 | Officials' contact policy | Punong Barangay | Office line only — privacy-safe default |
| 17 | Barangay history / name origin | Elders, Secretary | History page ships minimal and honest |
| 18 | Tumbod's MSPLS zone (core/buffer/multiple-use) and fishing rules | PCSD / DENR-BMB / PAMB | Omitted from v1. Strong v1.1 candidate — genuinely useful and nobody publishes it readably. |
| 19 | Does *Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod* exist and is it active? | Barangay | Omitted — desk research found **no source** for it |
| 20 | Local language check — is Cuyonon spoken? | Barangay | Filipino assumed |
| 21 | Connectivity and power reality on Tuluran | Field / carrier | Worst case assumed; changes nothing structural |
| 22 | Aling Fe's name, phone model, admin UI language | You | Mid-range Android, Filipino UI |

---

## ⚪ FACTS TO CORRECT OR CONFIRM

| # | Item | Status |
|---|---|---|
| 23 | "Shares no land border with any barangay" | **Not printed.** Strongly supported (Tuluran Island is also called Tumbod) but only 5 of 31 barangays checked. `CAN_CLAIM_NO_LAND_BORDER = false` in `src/lib/content/site.ts`. Barangay can simply confirm. |
| 24 | Elevation | **Deliberately omitted.** Only figure available (332.6 m) is implausible against neighbours (6.1 m, 8.2 m) and comes from a modelled aggregator. |
| 25 | Barangays around Malampaya Sound | **Not printed.** Sources conflict: 11 vs 18 vs 22. |
| 26 | Barangay created 1972 | Single weak source. Not printed. |
| 27 | Blockade / Endeavor Strait | Printed — verified. **But confirm residents actually use these names**, or use what they say instead. |

---

## ✅ VERIFIED AND IN USE

Population 1,744 (PSA 2020, 2.09% of Taytay) · 1,489 / 273 households / 5.45 avg (2015) · largest age band 5–9 at 208 persons · coordinates 10.9856 N, 119.2773 E · Tuluran Island 6.4 × 3.2 km barrier island · Blockade Strait 1.1 km W, Endeavor Strait 0.2 km E · MSPLS Proclamation 342 (2000), 200,115 ha · PCG prohibits vessels ≤3 GT from sailing in Taytay/El Nido in rough seas · Taytay has 31 barangays.

---

## 📐 DECLARED DEVIATIONS FROM SPEC

| Deviation | Where | Justification |
|---|---|---|
| Emergency control is a **link** to `/ligtas/hotline`, not a JS sheet | `SiteHeader.tsx` | Must work with no JS and no network. Target is precache tier 1. Same tap count, strictly more reliable, 0 KB. |
| Chart geometry is a **declared schematic** | `geometry.ts` | Real OSM extract not yet done. §3.2 forbids drawing fake coastline for a real navigable sound; the schematic is labelled in the UI and blocks launch. |
| Online document requests **deferred** | `/serbisyo/humiling` reserved | Decision B5. Model and feature flag exist; UI dark. |
| Palette sourced from place, not from barangay imagery | `tokens.css` | Declared Part D fallback — Facebook extraction blocked. |

---

## Added by the redesign — 2026-08-05

`DECISION-redesign.md` retired §35 and added eight routes. Each is live and
populated with **demo content**; each needs real content before launch.

| Route | What the barangay must supply | Who |
|---|---|---|
| `/kasaysayan` | Founding year **and its documentary basis**, plus the milestones worth recording. Never guessed — a founding date on an official site gets cited back by schools and agencies and is very hard to correct. | Barangay records / elders |
| `/bisyon` | The vision, mission and values **as adopted by resolution**. A website cannot write these on the barangay's behalf. | Sangguniang Barangay |
| `/turismo` | Which places are open to visitors, how to reach each, and **which are sanctuaries that may not be entered**. | Barangay Council |
| `/negosyo` | The Business Clearance register, **plus each owner's permission** to publish their name. | Barangay Treasurer |
| `/larawan` | Photographs. **Zero exist.** This is the single largest gap in how alive the site feels (`PRECEDENT-SCAN.md` §3). Consent is per person, and consent for Facebook is not consent for a website. | Barangay + each person |
| `/faq` | Answers only. The questions are already right; the fees, hours and evacuation sites in them are demo values set by ordinance. | Barangay Secretary |
| `/porma` | Actual PDFs. Every entry currently shows "no PDF yet" rather than a link — a download that 404s costs real data on a 2G connection to discover. | Barangay Secretary |
| `/proyekto` | The Annual Investment Program and 20% Development Fund utilisation. | Barangay Treasurer |

**Not built, deliberately:** an online feedback/contact form. Nobody can answer
one daily, and a form that silently discards submissions is worse than no form.
`/faq` and `/kontak` say so and point at the barangay hall and the hotline.

**The stat row on the homepage is real** — PSA census figures, in demo and
production alike. It is the one place in the redesign where invented numbers
were refused outright, because a stat row reading zeroes is exactly the failure
observed on brgy.to.

---

## 🔴 HERO VIDEO — TWO UNANSWERED QUESTIONS

`public/media/tumbod-hero.mp4` (5.5 MB, 1280×720, 29.9 s) was supplied by the
site owner and is live as the second hero slide. It shows a coastal
stilt-house settlement with outrigger bangkas at golden hour.

**Both of these are launch-blocking:**

1. **Is this actually Barangay Tumbod?** Nothing in the file establishes it.
   The caption deliberately describes what is *visible* — "video mula sa
   himpapawid ng baybaying pamayanan at mga bangka" — and does not name a
   place, because §0.2 does not allow asserting one we cannot verify. If the
   footage is of another village, it is currently the largest thing on
   Tumbod's front page and it is of somewhere else.

2. **Are the rights and consent in order?** The file arrived with a name
   matching a Facebook CDN download. Two separate issues:
   - *Copyright* — who shot it, and may the barangay publish it?
   - *Consent* — identifiable homes and boats appear. Consent for a Facebook
     post is not consent for a permanent, indexed government website. This is
     the same rule applied to the officials' photographs (B2).

**How it is handled until answered:** `preload="none"`, so nothing downloads
until a visitor reaches that slide; no autoplay on a metered or slow
connection (`saveData`, `2g`, `slow-2g`) or under reduced motion; a real pause
control; playback stops when the slide leaves the screen or the tab is hidden;
and `/media` is excluded from the service-worker cache, because 5.5 MB would
evict the pages that must survive a typhoon.

Replacing the file keeps all of that: same path, same poster name.

### Hero photographs — same two questions as the video

Four photographs were added on 2026-08-06 and are live in the hero carousel:

| File | Shows |
|---|---|
| `tumbod-falls.jpg` | A waterfall dropping into a cove, outrigger in the shallows |
| `tumbod-cove-1.jpg` | Aerial cove, shallow-to-deep water, single outrigger |
| `tumbod-cove-2.jpg` | Overhead reef with a moored outrigger |
| `tumbod-pantalan.jpg` | A concrete pier with flags and balloons, many boats moored |

**Unconfirmed, and launch-blocking:**

1. **Are these Barangay Tumbod?** Each `alt` describes only what is visible and
   names no place, for the same reason as the video. The pantalan shot in
   particular would be a strong claim: it looks like a barangay landing, and
   the site has a whole slide called "Ang pantalan" waiting for exactly that.
   Confirm it and the caption can say so.
2. **Rights and consent.** Filenames matched Facebook CDN downloads. The
   pantalan photograph contains identifiable houses and boats.

**How they are served:** thumbnails are 350 px derivatives (72 KB for all
four, `scripts/build-thumbs.mjs`); the full images are fetched only when their
slide is approached, and a `<noscript>` copy loads them normally when there is
no JavaScript.
