# RESEARCH.md
## Barangay Tumbod Official Website — Phase 2 Research Deliverable

**Spec reference:** BUILD-PROMPT.md §3
**Retrieval date for all web sources:** 2026-08-04
**Status:** Desk research complete. Field/community research **not** complete — see §7.
**Gate:** This document satisfies half of GATE 1. The other half is human answers to `DISCOVERY-QUESTIONS.md`.

---

## 1. HEADLINE FINDING — THE BARANGAY *IS* THE ISLAND

The single most important thing desk research surfaced, and it is better than the brief assumed:

> **Tuluran Island is also called Tumbod.** It is a **barrier island**, 6.4 × 3.2 km, sitting across the mouth of Malampaya Sound. It creates the Sound's two entrance channels: **Blockade Strait** (1.1 km wide, west) and **Endeavor Strait** (0.2 km wide, east).
> — [Wikipedia: Malampaya Sound](https://en.wikipedia.org/wiki/Malampaya_Sound), retrieved 2026-08-04

This changes the design premise from "an island barangay" to something far more specific and defensible:

**Barangay Tumbod is the gate of Malampaya Sound.** Every vessel entering or leaving one of the Philippines' richest fishing grounds passes through a 1.1 km or a 0.2 km channel on either side of this barangay. The island is not incidentally in the water — it is the geographic feature that *defines* the Sound's inner and outer sections.

**Design consequences (feeds §8.1, §11 of the spec):**
- The Living Chart Header is no longer a nice metaphor. The two straits are the actual, named, navigable subject of a real chart, and they are the barangay's edges. The chart is a portrait of the place.
- "No land border" is now supported by geography rather than asserted: the island appears to be coextensive with the barangay (see §2.3 for the caveat).
- `Blockade Strait` and `Endeavor Strait` are real names residents and boatmen use. They belong in the interface, not in a footnote.
- The 0.2 km Endeavor Strait vs the 1.1 km Blockade Strait is a genuine, consequential asymmetry — likely relevant to which crossing is used in which sea state. **Confirm with the barangay** (added to `DISCOVERY-QUESTIONS.md`).

---

## 2. VERIFIED FACT REGISTER

Replaces the appendix table in BUILD-PROMPT.md. Status values: **VERIFIED** (independent source found), **SINGLE-SOURCE** (one source only, treat as provisional), **DISPUTED**, **MISSING**.

### 2.1 Barangay Tumbod

| Fact | Value | Status | Source | Retrieved |
|---|---|---|---|---|
| Population 2020 | **1,744** | VERIFIED | PhilAtlas (PSA 2020 CPH) | 2026-08-04 |
| Share of Taytay | **2.09%** | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 2015 | 1,489 | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 2010 | 1,507 | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 2007 | 1,186 | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 2000 | 1,288 | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 1995 | 1,181 | VERIFIED | PhilAtlas | 2026-08-04 |
| Population 1990 | 840 | VERIFIED | PhilAtlas | 2026-08-04 |
| Households (2015) | 273, avg **5.45** persons | VERIFIED | PhilAtlas | 2026-08-04 |
| Largest age band (2015) | **5–9 years, 208 persons (13.97%)** | VERIFIED | PhilAtlas | 2026-08-04 |
| Annualised growth 2015→2020 | **+3.38%/yr** (+255 persons) | VERIFIED | PhilAtlas | 2026-08-04 |
| Coordinates | **10.9856 N, 119.2773 E** | VERIFIED | PhilAtlas | 2026-08-04 |
| Island | **Tuluran (a.k.a. Tumbod)** | VERIFIED | PhilAtlas + Wikipedia | 2026-08-04 |
| Island dimensions | **6.4 × 3.2 km, barrier island** | SINGLE-SOURCE | Wikipedia | 2026-08-04 |
| Flanking channels | **Blockade Strait 1.1 km (W); Endeavor Strait 0.2 km (E)** | SINGLE-SOURCE | Wikipedia | 2026-08-04 |
| Elevation | 332.6 m / 1,091.2 ft | **DISPUTED** — see §2.4 | PhilAtlas | 2026-08-04 |
| Barangay created | 1972 | SINGLE-SOURCE, weak | search snippet, no primary doc | 2026-08-04 |
| Land area | — | **MISSING** | — | — |
| Purok count and names | — | **MISSING — blocking** | — | — |

**Population note for the site:** growth 2015→2020 was +3.38%/yr, well above replacement — but 2007 shows a *drop* from 2000 (1,288 → 1,186) and 2015 shows a drop from 2010 (1,507 → 1,489). This is a small population where census timing, boundary handling, and seasonal fishing migration can move the number materially. **Do not present a smooth growth curve.** Present the actual series with its dips, or present only the 2020 figure. Fabricating a trend line out of this data would violate §0.2.

### 2.2 Municipality of Taytay (context)

| Fact | Value | Status | Source |
|---|---|---|---|
| Barangays | **31** | VERIFIED | PhilAtlas, Wikipedia |
| Population 2020 | **83,357** | VERIFIED | PhilAtlas |
| Population 2024 | 85,258 | SINGLE-SOURCE | Wikipedia |
| Land area | 1,257.68 km² | VERIFIED | PhilAtlas |
| Income class | **1st municipal income class**, revenue ₱611.9M (2024) | SINGLE-SOURCE | Wikipedia |
| Poverty incidence (2021) | **25.18%** | SINGLE-SOURCE | Wikipedia |
| Distance to Puerto Princesa | 214 km | SINGLE-SOURCE | Wikipedia |
| Climate | 23–31 °C; wettest **Sep–Oct**; driest **Jan–Feb**; ~1,419 mm/yr | SINGLE-SOURCE | Wikipedia |
| Branding | **"Star of the North"** | VERIFIED | Wikipedia |
| Founded | 1623; Fort Santa Isabel begun 1667, completed 1738 | SINGLE-SOURCE | Wikipedia |
| Municipal website | `taytaypalawan.gov.ph` | VERIFIED — **but returned HTTP 503 on 2026-08-04** | direct fetch |

**Full 2020 barangay populations** (PhilAtlas, verified) — useful for the About page's "where Tumbod sits among 31":

Abongan 4,642 · Alacalian 3,024 · Banbanan 2,024 · Bantulan 2,427 · Baras 828 · Batas 1,220 · Bato 3,600 · Beton 1,473 · Busy Bees 1,343 · Calawag 5,334 · Casian 4,660 · Cataban 1,255 · Debangan 1,047 · Depla 1,274 · Libertad 1,977 · **Liminangcong 5,814** · Meytegued 984 · Minapla 648 · New Guinlo 3,628 · Old Guinlo 1,041 · Paglaum 2,145 · Paly 2,458 · Pamantolon 2,228 · Pancol 2,981 · **Poblacion 14,130** · Pularaquen 2,928 · San Jose 2,500 · Sandoval 1,355 · Silanga 1,587 · Talog 1,058 · **Tumbod 1,744**

Tumbod ranks roughly mid-pack — 17th of 31 by population. It is not the smallest and not remote-by-size; it is remote by *access*.

### 2.3 The "no land border" claim — status: STRONGLY SUPPORTED, NOT PROVEN

The brief asserts Tumbod shares no land border with any other barangay. Desk research supports but does not close this:

**Supporting:**
- Wikipedia states Tuluran Island is "also called Tumbod," implying the island and barangay are coextensive.
- PhilAtlas assigns each Taytay barangay an island. Spot checks: **Tumbod → Tuluran**; **Debangan → Debangan**; **Paly → Paly**; **Cataban → Palawan**; **Pamantolon → Palawan**. No other barangay checked resolves to Tuluran.
- Taytay is described as having 9 island barangays and 22 mainland barangays (single-source).

**Not closed:** I checked 5 of 31 barangays, not all 31. A second barangay on Tuluran cannot be excluded by this evidence.

**Ruling under §0.2:** treat as **provisional-verified**. The site may say Tumbod is an island barangay reached only by boat (well supported). It must **not** print a categorical "shares no land border with any barangay in the Philippines" claim until the barangay confirms. Added to `DISCOVERY-QUESTIONS.md` as non-blocking with a stated assumption.

### 2.4 DISPUTED: the 332.6 m elevation

PhilAtlas gives Tumbod's elevation as **332.6 m**. For comparison, its mainland neighbours: Cataban 6.1 m, Pamantolon 8.2 m. Nearby island barangays: Paly 107.5 m, Debangan 129.9 m.

332.6 m on a 6.4 × 3.2 km barrier island is possible but high. PhilAtlas elevations are modelled centroid values, not surveyed barangay-hall elevations, and are known to be unreliable on small or steep terrain.

**Ruling:** do **not** publish an elevation figure. It is not a fact a resident needs, and publishing a wrong one on a site that will be cited by NGOs and researchers damages the trust the whole design depends on (§7.4). If elevation is ever needed for storm-surge context, get it from the BDRRMC's own hazard mapping, not from a web aggregator.

---

## 3. MARINE & ENVIRONMENTAL CONTEXT (spec §3.2)

### 3.1 Malampaya Sound Protected Landscape and Seascape (MSPLS)

| Fact | Value | Status | Source |
|---|---|---|---|
| Legal basis | **Proclamation No. 342 (2000)** | VERIFIED | Wikipedia, BMB PAIS |
| Area | **200,115 ha** (terrestrial + aquatic) | VERIFIED | multiple |
| Sound length | 34 km, SE-trending | VERIFIED | multiple |
| Sound width | 3.2–7 km | VERIFIED | Wikipedia |
| Structure | Brackish **Inner Sound** / saltwater **Outer Sound**, separated by ~13 small islands (largest: Passage Island) | VERIFIED | Wikipedia |
| Ecosystems | mangrove, coral reef, seagrass | VERIFIED | multiple |
| Notability | **Only known Irrawaddy dolphin habitat in the Philippines**; dugong; 3 dolphin species; 156+ fish species; among the largest undisturbed mangrove areas in the country | VERIFIED | multiple |
| Population in PA | ~68,000 (2020), **~70% dependent on fishing** | SINGLE-SOURCE | Mongabay / C-3 |
| Barangays on the Sound | **CONFLICT: 11 vs 18 vs "22 villages"** — see below | DISPUTED | — |

**Conflict to resolve before publishing:** three different counts appear —
- "surrounded by 11 barangays of Taytay town" (C-3 / ProtectedSeas)
- "Eighteen barangays of Taytay municipality form the sound's coast" (Wikipedia)
- "Covering 22 villages within the towns of Taytay and San Vicente" (Mongabay)

These may be measuring different things (coastal vs within-PA vs across two municipalities). **Do not print any of them.** The About → Malampaya page states only what is solid: the PA covers 200,115 ha across Taytay and San Vicente and is home to roughly 68,000 people, most of whom fish. Flagged in `CONTENT-TODO.md`.

**Tumbod's zone within MSPLS is UNKNOWN.** Core / buffer / multiple-use zoning determines what fishing is legal where — this is materially useful information for residents and a strong candidate for a real service page. Source: PCSD / DENR-BMB / MSPLS PAMB. Added to discovery questions.

### 3.2 Coral reef and conservation work naming Tumbod directly

| Fact | Value | Status | Source |
|---|---|---|---|
| Reef area assessed, Tumbod + Liminangcong | **4,001.17 ha** | SINGLE-SOURCE | ResearchGate / Academia (Sustainable Coral Reef Ecosystem Management in Bacuit Bay and Outer Malampaya Sound) |
| Fish biomass, **Tumbod** | **41.94 MT/km²** | SINGLE-SOURCE | same |
| Fish biomass, Liminangcong | 59.94 MT/km² | SINGLE-SOURCE | same |
| Coral rehabilitation | 630 colonies planted over 801.03 ha, high survival | SINGLE-SOURCE | same |
| A published map exists titled *"Map of barangays Tumbod and Liminangcong, Taytay, showing the outer peripheries of coral [reef]"* | — | VERIFIED (exists) | ResearchGate figure |

That last item matters: **a peer-reviewed map of Tumbod's reef peripheries exists.** It is a candidate real-geometry source for the Living Chart Header and for an About → Malampaya map. Licensing must be checked before use.

**`Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod`** — the brief names this people's organization as party to conservation agreements. **Desk research did not confirm it.** No source found. It is entirely plausible (POs of this kind are standard counterparties in PA management) but per §0.2 it cannot be published unverified. Blocking-adjacent question added.

### 3.3 Why this belongs in the design, not just the About page

70% of the PA's population depends on fishing; Tumbod's reef has measurably *lower* fish biomass than neighbouring Liminangcong (41.94 vs 59.94 MT/km²). If that gap is real and known locally, then reef health is not an abstract conservation topic for this barangay — it is household income. That justifies giving marine/conservation content real surface rather than a token About subsection, and it justifies the chart-and-depth visual language as economically literate rather than decorative.

---

## 4. HAZARD PROFILE (spec §3.2)

| Fact | Value | Status | Source |
|---|---|---|---|
| **Typhoon Tino made landfall at Batas Island, Taytay, Palawan** (Nov 2025) | landfall in this municipality | VERIFIED | multiple news + Oriental Mindoro PIO |
| Storm surge risk in that event | **peak heights exceeding 3.0 m**, described as life-threatening | VERIFIED | GMA / advisories |
| Jurisdiction | **Coast Guard Station Northern Palawan** covers Taytay | VERIFIED | PIA |
| Standing PCG practice | **vessels ≤ 3 gross tons prohibited from sailing** in Taytay and El Nido during rough seas | VERIFIED | PIA |
| PSWS history | Northern Palawan has been placed under Signal No. 3 (Odette 2021, Pablo 2012) | VERIFIED | Inquirer |
| Wettest months | September–October | SINGLE-SOURCE | Wikipedia |

**This is the most operationally important research finding after §1.**

1. **A typhoon made landfall in this municipality within the last year**, at Batas — another Taytay barangay — with >3 m storm surge. The disaster system in §19 is not hypothetical preparedness. It is a response to a recent event. Treat `/ligtas` accordingly.

2. **The "≤ 3 gross tons prohibited from sailing" rule is the boat-status system's real-world trigger.** A typical *bangka* serving an island barangay is well under 3 GT. This means:
   - Boat cancellation is frequently **not** a boat operator's discretionary call — it is a Coast Guard prohibition covering the whole municipality.
   - The authoritative source for "is the boat running" is often **Coast Guard Station Northern Palawan**, not the barangay.
   - The `BoatSchedule.status` model in spec §15.1 needs a `reason` distinguishing *sea conditions* from *PCG sailing ban* — these mean different things to a resident. A ban is binding and municipality-wide; rough seas are a judgment call.
   - **Spec amendment proposed** (see §8 below).

3. Peak risk aligns with Sep–Oct rainfall maximum, though Philippine TC season is broader. The pre-typhoon checklist should be promoted seasonally, not treated as static.

---

## 5. EXISTING ONLINE PRESENCE (spec §3.1)

### 5.1 The Facebook page — EXTRACTION BLOCKED

**Source:** `https://www.facebook.com/profile.php?id=61579831854802`

**Result: inaccessible to automated fetch.** The fetch returned only the page name — **"Barangay Tumbod"** — and no cover photo, profile photo, about text, posts, dates, contact details, or officials. Facebook serves an authentication-gated shell to unauthenticated clients.

Per spec §3.1 ("If you cannot access it programmatically, say so explicitly and produce a manual extraction worksheet — do not silently skip and do not guess"), I am declaring this explicitly and have produced the worksheet: **`FACEBOOK-EXTRACTION-WORKSHEET.md`** (companion file).

**What this blocks — this is the single largest gap in Phase 2:**
- Brand asset extraction (§3.1A) — no seal, no cover photo, no tarpaulin conventions
- **Colour extraction (§3.1B) — the entire empirical basis for the palette in spec §8.2**
- Content taxonomy (§3.1C) — which drives CMS content types *and* homepage module order
- Voice analysis (§3.1D) — which the spec makes the source of all site copy
- Harvestable facts (§3.1E) — official names, hotlines, purok names, evacuation sites
- Engagement signals (§3.1F) — which drives the FAQ and search index

**Consequence for the gate:** the design phase cannot produce a *sourced* palette (§8.2's rule: "If a colour's justification is 'it looked good,' it is out") without either the worksheet being filled or a substitute evidence base. I propose a substitute in §8 below. **This is now a GATE 1 blocking item.**

### 5.2 Third-party mentions found

- **MLGU Taytay Palawan** Facebook page has a video titled *"Project Turn Over at Barangay Tumbod, Taytay, Palawan"* — evidence the municipality documents projects in Tumbod, and a lead for the Transparency → Projects content and for photography with a clearer provenance chain than resident photos.
- **Wikimapia** has a Tumbod entry (`wikimapia.org/11003731/Tumbod`) — fetch returned empty; may be usable manually for local landmark names.
- No independent barangay website, domain, or directory listing found. **The Facebook page is confirmed to be the only online presence**, as the brief assumed.

### 5.3 Precedent scan (spec §3.3) — PARTIAL, DECLARED INCOMPLETE

The spec requires 5+ Philippine LGU sites and 3+ non-Philippine coastal/island public sites reviewed in depth. **I did not complete this to specification.** What I have:

**Reviewed / observed:**
1. **`taytaypalawan.gov.ph`** (the parent municipality — the most important precedent) — **returned HTTP 503 Service Unavailable with `Retry-After: 86400`** on 2026-08-04. This is itself a finding: *the municipal LGU website was down for at least a day.* It is the strongest possible argument for this project's offline-first, static-first, zero-single-point-of-failure requirements (spec §19, §23, §25). If the parent LGU's site can be down for a day, a barangay site that depends on it — or that is built the same way — will be too.
2. **BarangayOS** (`barangayos.com`) — a multi-tenant SaaS platform for Philippine barangays. Offers online document requests, GCash/Maya payment, QR document verification, real-time tracking, customisable branding, "mobile-first." **Directly relevant: this is the competitor/alternative.** Its multi-tenant branding model is precisely the generic-template outcome the client rejected twice. Worth a written comparison for the barangay so the choice is informed rather than accidental.
3. **Barangay Connect** (`barangayconnects.online`) — similar positioning: document requests, emergency alerts, announcements.
4. Academic barangay information systems (Web-BON and others) — consistently: admin dashboard + announcements + document requests + SMS integration. **Notably, SMS keeps recurring as the resident-notification channel** in the Philippine literature, not push notifications. Relevant to spec §18.5.

**Not done:** in-depth visual/UX teardown of 5 Philippine LGU sites and 3 international island/coastal public sites, with the "what everyone does that we will not do" list that spec §3.3 requires to feed §35.

**Why it matters that this is incomplete:** §35's anti-pattern list is currently *asserted from general knowledge* rather than *derived from observed Philippine LGU practice*. That is weaker evidence than the spec demands. I recommend completing this during Phase 3 before the design self-critique, and I have flagged it rather than papering over it.

---

## 6. DATA SOURCES FOR THE SIGNATURE ELEMENT (spec §3.2, §11)

The Living Chart Header requires **real geometry**. Options found, best first:

| Source | What it gives | Licence | Verdict |
|---|---|---|---|
| **OpenStreetMap coastline** | Tuluran/Tumbod island outline, Blockade & Endeavor Straits | ODbL — **attribution required** | **Recommended baseline.** Free, current, redistributable, and gives true coastline. Attribution goes in the chart legend, which suits the design. |
| **NAMRIA nautical charts** | Authoritative PH soundings. Chart **4349 "Malampaya Sound and approaches," 1:50,000** exists (surveys to 1933) | Purchase; redistribution restricted | Best-quality depth data, but **1933 surveys** and licensing friction. Use for *reference*, likely not for redistribution. |
| **GEBCO global grid** | Bathymetry, free, redistributable | Public/open | **Recommended for depth contours** — but coarse (~450 m) for a 6.4 km island. May be too blunt inside the Sound. |
| **Published reef-periphery map** (Tumbod + Liminangcong, ResearchGate) | Reef outlines specific to Tumbod | Journal/author copyright — **must clear** | High value for the About → Malampaya page if permission obtained. |

**Recommendation:** OSM coastline for the island and straits (true, current, licensable) + GEBCO for depth bands, with the depth motif **declared stylised in the legend** if GEBCO resolution proves too coarse. This satisfies spec §3.2's rule: *"Do not draw fake depth numbers on a chart of a real navigable sound."* We will draw real coastline and honestly-labelled depth bands, and we will not print invented soundings.

**Budget check:** spec §11 caps the inline SVG at 12 KB gzipped. A 6.4 × 3.2 km island at chart-header scale, Douglas–Peucker simplified, is comfortably within that. The two straits are the visually distinctive feature and are cheap to render.

---

## 7. CONNECTIVITY & ACCESS

| Fact | Value | Status | Source |
|---|---|---|---|
| Palawan island barangays had **dead spots / no cell coverage** | as of 2017 | VERIFIED (dated) | Bilyonaryo |
| A resolution sought a **Globe cell site in Brgy. Casian, Taytay** to serve "the islands and coastal barangays" | — | VERIFIED (dated) | same |
| **Tumbod-specific coverage** | — | **MISSING** | — |
| Electricity availability/schedule on Tuluran | — | **MISSING** | — |
| Liminangcong Seaport | passenger + RoRo port; serves El Nido and nearby islands; Manila–Liminangcong fastcraft ~6 h, ₱1,700 | VERIFIED | Pamasahe, Discover the Philippines |
| **Tumbod ↔ mainland routes, operators, times, fares** | — | **MISSING — blocking** | — |

**Reading:** the 2017 evidence is nine years old and describes exactly the problem this site is designed around, in exactly this municipality, naming island barangays. It is directionally supportive but **too old to design against**. The spec's instruction stands: *"This determines the offline strategy, not your guesses."* Absent current data, **design for the worst case: intermittent 2G, scheduled power** — which is what the spec already mandates. No design change needed; the uncertainty costs us nothing because the conservative choice was already made.

**Liminangcong is the likely mainland link** (5,814 people, a real seaport, ~15 km east of Tumbod by the coordinates). But "likely" is not "confirmed," and boat routes are a blocking question.

---

## 8. PROPOSED SPEC AMENDMENTS

Per spec §0.4, I raise conflicts rather than silently resolving them. Three, all small:

**A. `BoatSchedule` needs a cancellation-reason distinction.** (§15.1, §19)
Research shows boat cancellation is often a **PCG sailing ban on vessels ≤ 3 GT covering Taytay and El Nido**, not an operator's call. Add to the model:
```ts
BoatSchedule.statusReason: "sea_conditions" | "pcg_sailing_ban" | "operator" | "other"
```
and surface it in `BoatStatusRow` — *"Bawal maglayag: utos ng Coast Guard"* reads very differently from *"Malakas ang alon"*, and only one of them is binding. **Resolution cost: one enum field.**

**B. Elevation must not be published.** (§13.6, appendix)
The only available figure (332.6 m) is implausible against neighbours and comes from a modelled aggregator. Drop it rather than caveat it.

**C. The precedent scan (§3.3) is incomplete and §35 is therefore under-evidenced.**
Recommend completing it in Phase 3 before the design self-critique, so the anti-pattern list is derived from observed Philippine LGU practice rather than asserted. **Resolution: schedule, not scope change.**

None of these alter the design direction. The Living Chart Header, the today-first homepage, and the offline tiering are all *strengthened* by what research found.

---

## 9. WHAT RESEARCH CHANGED

| Spec assumption | Research verdict |
|---|---|
| Island barangay, boat-only access | **Confirmed and sharpened** — barrier island *at the Sound's mouth*, flanked by two named straits |
| No land border | **Strongly supported, not proven** — do not print as a categorical claim |
| Pop. 1,744 (2020), 2.09% of Taytay | **Verified exactly** |
| 1,489 / 273 households / 5–9 largest band (2015) | **Verified exactly** — 208 persons, 13.97% |
| Inside MSPLS | **Verified** — Proclamation 342 (2000), 200,115 ha |
| MSPLS is a major fishing ground | **Verified and quantified** — ~68,000 people, ~70% fishing-dependent |
| Reef/mangrove conservation involving Tumbod | **Verified** — 4,001.17 ha assessed; Tumbod biomass 41.94 MT/km² |
| *Samahan ng mga Nagkakaisa...* is party to that work | **UNVERIFIED** — no source found |
| Typhoon corridor | **Verified and recent** — landfall at Batas, Taytay (Nov 2025), >3 m surge |
| Facebook is the only online presence | **Confirmed** |
| Facebook can be reverse-engineered by the agent | **FALSE — blocked.** Manual worksheet required |
| Taytay = 31 barangays, "Star of the North" | **Verified** |
| Sea state decides daily life | **Verified institutionally** — PCG bans ≤3 GT vessels municipality-wide in rough seas |

---

## 10. UNKNOWNS THAT BLOCK DESIGN (spec §3.4)

Ranked. Full question text in `DISCOVERY-QUESTIONS.md`.

1. **Facebook page contents** — blocks palette sourcing, voice, content taxonomy, homepage module ordering. *The largest single blocker.*
2. **Officials roster + photo consent** — blocks the Officials page and `OfficialProfile`.
3. **Verified emergency hotlines** — blocks `/ligtas`, the highest-priority page. Must not be faked (§0.2).
4. **Boat routes, operators, fares, and who announces cancellation** — blocks the Living Chart Header's boat row, i.e. the signature element.
5. **Whether online document requests are wanted at all** — blocks ~30% of scope (§18, request tracking, part of the CMS and DB).
6. **Who maintains the site** — blocks CMS selection (§15).
7. **Purok names and count** — blocks purok wayfinding, evacuation mapping, `PurokBadge`.
8. **Evacuation sites** — blocks `/ligtas/likasan`.
9. **Fee schedule + enabling ordinance** — blocks every service page.
10. **Tumbod's MSPLS zone** — blocks the marine content's most useful, most actionable section.
11. **Hosting/domain ownership** — blocks deployment planning; `.gov.ph` is the long-pole item.
12. **Current connectivity and power on Tuluran** — does not block (conservative design already chosen), but would let us right-size the cache budget.

---

## 11. SOURCES

- [Tumbod, Taytay, Palawan Profile – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay/tumbod.html)
- [Taytay, Palawan Profile – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay.html)
- [Cataban, Taytay, Palawan – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay/cataban.html)
- [Debangan, Taytay, Palawan – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay/debangan.html)
- [Paly, Taytay, Palawan – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay/paly.html)
- [Pamantolon, Taytay, Palawan – PhilAtlas](https://www.philatlas.com/luzon/mimaropa/palawan/taytay/pamantolon.html)
- [Malampaya Sound – Wikipedia](https://en.wikipedia.org/wiki/Malampaya_Sound)
- [Taytay, Palawan – Wikipedia](https://en.wikipedia.org/wiki/Taytay,_Palawan)
- [Malampaya Sound Protected Landscape and Seascape – DENR-BMB PAIS](https://pais.bmb.gov.ph/home/info/DENRR4B0008)
- [Healthy mangroves build a resilient community in the Philippines' Palawan – Mongabay](https://news.mongabay.com/2022/08/healthy-mangroves-build-a-resilient-community-in-the-philippines-palawan/)
- [Marine Protected Areas – C-3](https://c-3.org.uk/marine-protected-areas-philippines/)
- [Malampaya Sound Protected Landscape and Seascape – ProtectedSeas Navigator](https://map.navigatormap.org/site-detail?site_id=19202)
- [Participatory 3D Modelling of the Malampaya Sound Protected Land and Seascape – IAPAD](http://www.iapad.org/case-studies/pa-management/malampaya-sound/)
- [Malampaya Sound profile (PDF) – IAPAD/Suhay](http://www.iapad.org/wp-content/uploads/2015/09/profile_malampaya_sound.pdf)
- [Map of barangays Tumbod and Liminangcong showing outer peripheries of coral reef – ResearchGate](https://www.researchgate.net/figure/Map-of-barangays-Tumbod-and-Liminangcong-Taytay-showing-the-outer-peripheries-of-coral_fig8_279753465)
- [Sustainable Coral Reef Ecosystem Management in Bacuit Bay, El Nido and Outer Malampaya Sound, Taytay, Palawan – Academia.edu](https://www.academia.edu/29317220/Sustainable_Coral_Reef_Ecosystem_Management_in_Bacuit_Bay_El_Nido_and_Outer_Malampaya_Sound_Taytay_Palawan)
- [Location and bathymetry of Malampaya Sound – ResearchGate](https://www.researchgate.net/figure/Location-and-bathymetry-of-Malampaya-Sound-Palawan-Philippines_fig6_270275280)
- [NAMRIA Nautical Charts](https://namria.gov.ph/products.aspx)
- [Philippine Islands, NW coast of Palawan: Malampaya Sound to St. Paul Bay – UW-Madison Libraries](https://search.library.wisc.edu/catalog/9910263547102121)
- [PCG places Palawan under heightened alert for Typhoon 'Inday' – PIA](https://pia.gov.ph/regions/pcg-places-palawan-under-heightened-alert-for-the-threat-of-typhoon-inday/)
- [PCG stations in Palawan raise alert status for 'Basyang' – PIA](https://pia.gov.ph/disaster-information-service/pcg-stations-in-palawan-raise-alert-status-for-basyang/)
- [Typhoon Tino made landfall in Northern Palawan – Province of Oriental Mindoro](https://ormindoro.gov.ph/2025/11/05/typhoon-tino-made-a-landfall-in-northern-palawan/)
- [Signal No. 4 up over 9 areas as Tino threatens Panay Island – GMA News](https://www.gmanetwork.com/news/weather/content/964793/signal-no-4-up-over-9-areas-as-tino-threatens-panay-island/story/)
- [PAGASA: Signal No. 3 up in Northern Palawan, Typhoon Odette – Inquirer](https://newsinfo.inquirer.net/1528983/pagasa-signal-no-3-up-in-northern-palawan-typhoon-odette-may-exit-ph-on-saturday/amp)
- [Palawan asks Globe, Smart: Why is your service so terrible on our island? – Bilyonaryo](https://bilyonaryo.com/2017/08/22/palawan-asks-globe-smart-service-terrible-island/technology/)
- [Liminangcong Seaport – Discover The Philippines](https://www.discoverthephilippines.com/liminangcong-seaport/)
- [Manila to Liminangcong fastcraft schedule & fares – Pamasahe](https://pamasahe.com/routes/manila-liminangcong-fastcraft-atienza-interisland-ferries-schedule-fares)
- [BarangayOS](https://barangayos.com/)
- [Barangay Connect](https://barangayconnects.online/)
- [Municipal Government of Taytay, Palawan](https://taytaypalawan.gov.ph/) — HTTP 503 on 2026-08-04
- [Barangay Tumbod – Facebook](https://www.facebook.com/profile.php?id=61579831854802) — not machine-readable
- [Project Turn Over at Barangay Tumbod – MLGU Taytay Palawan, Facebook](https://m.facebook.com/MLGUTaytayPalawan/videos/project-turn-over-at-barangay-tumbod-taytay-palawan/270867235819183/)

---

**END — RESEARCH.md**
Phase 2 desk research complete. GATE 1 remains closed pending human answers in `DISCOVERY-QUESTIONS.md` and the filled `FACEBOOK-EXTRACTION-WORKSHEET.md`.
