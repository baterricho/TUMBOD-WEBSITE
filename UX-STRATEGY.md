# UX-STRATEGY.md

**Spec reference:** BUILD-PROMPT.md §5, §7

---

## 1. THE GOVERNING QUESTION

Every screen answers **"Ano ang kailangan kong malaman ngayon?"**
If a section answers no question a named persona actually has, it is deleted.

---

## 2. PERSONA → MODULE MAP (spec §34.1 item 8)

| # | Homepage module | Serves | Justification |
|---|---|---|---|
| 0 | EmergencyBanner | P1 P6 P7 | the only thing that matters when active |
| 1 | Living Chart: sea, wind, boat | **P1** P7 | decides whether today is possible |
| 2 | Boat advisory strip | P1 | PCG bans are binding and municipality-wide |
| 3 | Office status | P1 | prevents a wasted crossing |
| 4 | Quick actions ×4 | P1 | intent capture in one tap |
| 5 | Latest announcements ×3 | P1 P6 | the recurring reason to return |
| 6 | Next health outreach | P1 | child health; largest age band is 5–9 |
| 7 | Emergency contacts ×4 | P1 P6 P7 | **must render offline, always** |
| 8 | Popular documents ×3 | P1 | the "what do I bring" answer |
| 9 | Calendar next 3 | P1 P4 | assemblies, SK activity |
| 10 | Recent projects ×2 | P5 P2 | transparency; competence to funders |
| 11 | Downloadable forms ×3 | P1 | fill before crossing |
| 12 | Facebook mirror | P1 P6 | where the community actually is |
| 13 | Island intro | P5 | context for outsiders, placed last |

**No orphan modules.**

---

## 3. PERSONA NOTES THAT CHANGED THE DESIGN

**P1 Marilou** (fish vendor, Android Go, ₱50 load, one bar at the pier) — she is *paying* to load this site. The byte budget is a courtesy to her wallet, not an engineering vanity. Drove: answers above the fold, 150 KB homepage, zero third-party requests.

**P2 Kap. Rene** (Punong Barangay) — will ask for his photo on the homepage. Prepared answer: the homepage's job is service to residents, which reflects better on the administration than a portrait; the seal and leadership are prominent on About and Officials. Compromise offered: "Mensahe ng Punong Barangay" on About.

**P3 Aling Fe** (Secretary) — **now confirmed as a real, named person** (decision B6). The 5-minute publishing test is timed against her, not simulated. Drove: phone-first admin, autosave, no markdown, no build step, Filipino UI, undo.

**P4 Jomar** (SK Kagawad, 17) — the most digitally fluent person on the island and your unofficial support desk. Gets a real CMS role and real SK surface.

**P5 Ms. Alvarez** (municipal / NGO / researcher) — drove: complete English mirror, structured data, sane PDF names, usable desktop tables.

**P6 Ate Josie** (OFW, checks at 3 a.m. during typhoons) — drove: every advisory carries relative **and** absolute timestamps with timezone; staleness is stated, never silent.

**P7 Ka Ben** (fisherman, low literacy) — drove: colour never carries meaning alone; sea state is colour **+ Filipino word + icon**; 16px minimum; no thin weights.

---

## 4. INTERACTION PRINCIPLES

1. **Answer first, context second.** "MALAKAS" before the wave height. Fee before the legal basis.
2. **Never make someone travel to learn something.** Requirements, fee, hours, and the person to approach are all on the page. That is the whole value proposition.
3. **State staleness honestly.** >6h old → "Maaaring luma na." >24h → "Hindi na-update" + call the hotline. Silent staleness on a disaster module is a P0 defect.
4. **Progressive disclosure with real defaults.** Collapse detail, never the answer. An accordion hiding the fee is a bug.
5. **One task per screen at 360px.**
6. **Offline is a designed state, not an error.** Calm band with a cache timestamp — never a browser error page.
7. **Forms forgive.** Autosave debounced; validate on blur; errors say what to do.

---

## 5. KEY JOURNEYS

**J1 — "Tuloy ba ang biyahe bukas?"** (P1, daily)
Home → answer visible at 0 taps. If uncertain → tap the boat row → `/ligtas/dagat` for the rule and the number to call. **Must work on cached data.**

**J2 — "Ano ang dala ko para sa clearance?"** (P1, the wasted-trip preventer)
Home → quick action → checklist first on the page → tick items over several days (persisted) → "Kopyahin ang listahan" → paste into Messenger. Print stylesheet for the barangay hall bulletin board.

**J3 — "May bagyo. Ano ang gagawin namin?"** (P1 P6 P7, rare and critical)
Any page → Emergency button (always visible) → sheet with `tel:` links + current advisory → `/ligtas`. **Zero network, zero JS, zero third parties.** Print survives black-and-white photocopy.

**J4 — "Kailangan kong mag-post ng anunsyo."** (P3, twice monthly)
Admin → `+ Bagong Anunsyo` → category by icon → type (autosave 2s) → optional photo → publish. **Under 5 minutes on a phone.** Undo for 30s.

**J5 — "Sino ang mga opisyal at saan ang budget?"** (P5, from Google)
Search → `/opisyal` or `/transparency` → roster with terms, or documents with plain-language summaries. English mirror complete.

---

## 6. TRUST DESIGN

Specificity earns trust: named people with real titles, timestamps on everything, cited ordinance numbers, "as of" dates on every figure, and an honest **"hindi pa na-po-post"** with a reason instead of an empty table that implies non-compliance.

**Corollary we hold to:** a placeholder that looks like real data is worse than a visible gap. Every unknown renders as `[[NEEDS DATA: … ]]`, flagged, and fails the production build.
