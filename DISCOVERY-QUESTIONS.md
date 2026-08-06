# DISCOVERY-QUESTIONS.md
## Barangay Tumbod Official Website — Questions requiring human answers

**Spec reference:** BUILD-PROMPT.md §4
**Companion to:** `RESEARCH.md`, `FACEBOOK-EXTRACTION-WORKSHEET.md`
**Date:** 2026-08-04

---

## HOW TO USE THIS DOCUMENT

**BLOCKING** questions must be answered before design begins. Design decisions made without them would have to be thrown away.

**NON-BLOCKING** questions have a stated assumption. Work proceeds on the assumption; if the real answer differs later, the cost is a content edit, not a redesign. **If you do not answer these, the assumption is what gets built** — so skim them and correct anything wrong.

Answers can be partial. "We don't know yet" is a useful answer — it tells us to design for absence rather than wait.

Some questions are for the **barangay**; some are for **you (the client/commissioner)**; a few are for the **municipality or an agency**. Each is tagged.

---

# PART A — BLOCKING QUESTIONS

## B1. The Facebook page — *the largest single blocker* 🔴
**Ask: whoever administers the page**

Automated extraction failed (see `RESEARCH.md` §5.1). Facebook serves nothing readable to unauthenticated clients. Without this, we cannot source the colour palette from evidence, cannot match the barangay's existing voice, and cannot let real posting patterns drive the homepage order — all of which the specification requires.

**What we need:** `FACEBOOK-EXTRACTION-WORKSHEET.md` filled in. It is designed to take about 45 minutes by someone with access to the page.

**Minimum viable subset if 45 minutes isn't available:**
1. The profile photo / seal at the largest size available (download, don't screenshot)
2. The cover photo
3. Screenshots or copy-paste of the **10 most recent posts**, with dates
4. A rough count: of the last 30 posts, how many were announcements vs. health outreach vs. relief/ayuda vs. disaster advisory vs. ceremonial?

**If nobody can do this:** say so, and we will proceed under a declared substitute evidence base (see the fallback proposal in Part D). That path is legitimate but weaker, and it must be a decision, not a drift.

---

## B2. Officials roster and photo consent 🟡 PARTLY RESOLVED — 2026-08-05
**Ask: Barangay Secretary**

> **RESOLVED — names.** The elected 2023–2026 roster is now in `fallback.ts`
> and rendering: Punong Barangay **Natividad M. Gabriel**, 7 Kagawad, SK
> Chairperson **Cjay U. Manalo**, Secretary **Julie B. Batiancela**, Treasurer
> **Cecilia T. Ebajo**. Sourced from barangaydirectory.com and **confirmed by
> the site owner** — a second source (micto.net) gave a conflicting list, and
> the confirmation is what settled it. See `FINDINGS-2026-08-05.md` §2.
>
> **STILL BLOCKING — everything else on this question:**
> - **Photo consent.** No photographs, and this is the single largest remaining
>   liveliness gap (`PRECEDENT-SCAN.md` §3 ranks it #1). Nothing renders until
>   consent is recorded per person.
> - **Committee assignments** for the 7 Kagawad — unknown, deliberately blank.
> - **Exact term start/end dates** — only the year range "2023–2026" is known.
> - **The 7 SK Kagawad** — only the Chairperson is known. The page says so.
> - **Lupong Tagapamayapa, Tanod, BHW, BNS** — entirely unknown.
>
> ⏳ **This roster expires on 2 November 2026** (BSKE, COMELEC Res. 11191).

For each person: **full name, correct spelling, honorific** (Kgg./Hon./Kap.), **position**, **committee assignments**, **term start and end dates**.

Positions needed:
- Punong Barangay
- 7 × Barangay Kagawad (with committees)
- SK Chairperson + SK Kagawad
- Barangay Secretary
- Barangay Treasurer
- Lupong Tagapamayapa members
- Barangay Health Workers (BHW)
- Barangay Nutrition Scholar (BNS)
- Barangay Tanod

**And critically — photos:**
- Do usable photos exist? At what quality?
- **Has each person given consent for their photo to be published on a public website?** Consent for a Facebook post is not consent for a permanent indexed website. The CMS will refuse to publish a photo without a consent flag (spec §15.2).
- If consent is unavailable for some people, we ship a dignified typographic placeholder for them — not a grey silhouette. That is a supported state, not a failure.

**Why blocking:** the Officials page cannot be designed around unknown cardinality. Seven kagawad with committees lays out differently from a roster of thirty including tanod and BHWs.

---

## B3. Emergency hotline numbers — verified and currently answered 🟡 PARTLY RESOLVED — 2026-08-05
**Ask: Barangay Secretary + BDRRMC**

> **RESOLVED — the barangay's own two numbers.** `0927-978-7629` and
> `0928-284-0826`, confirmed working by the site owner on 2026-08-05. Now live
> as `tel:` links with `verifiedAt` and `verifiedBy` set.
>
> **STILL BLOCKING — every other number on `/ligtas/hotline`:** BDRRMC, Coast
> Guard Station Northern Palawan, RHU Taytay, MDRRMO Taytay, PNP Taytay. These
> are the ones a resident reaches for when the barangay hall does not answer.
>
> **And the three questions that matter more than the digits are still open:**
> 1. Who re-checks these, and how often? (90-day staleness flag is built.)
> 2. Is either number answered by a *person*, or is it a handset that may be
>    off? If the latter, the site must say so — a resident who calls an
>    unanswered number in an emergency loses trust permanently.
> 3. Both numbers appear to be mobiles, so they likely follow whoever holds the
>    handset. **Re-verify before 3 November 2026** — the election changes who
>    that is.

Exact numbers for: **Barangay hotline · BDRRMC · Tanod · BHW/health · Municipal DRRMO (Taytay) · Coast Guard Station Northern Palawan · nearest hospital/RHU · PNP**.

Then, three questions that matter more than the numbers:
1. **Who confirms these are live**, and how often will they be re-checked? (The CMS will flag any number unverified for 90+ days.)
2. **Is each number answered by a person, or is it a mobile that may be off?** Say so on the site if it's the latter — a resident who calls an unanswered number in an emergency loses trust permanently.
3. **May these be published publicly**, or are some internal-only?

**Why blocking, and why we will not proceed without it:** `/ligtas` is the highest-priority page in the specification. A fabricated or stale hotline number on a disaster page, on an island in a typhoon corridor where a typhoon made landfall in this municipality in November 2025, is the worst failure this project can produce. Specification §0.2 forbids inventing them and there is no acceptable workaround.

---

## B4. Boat reality — routes, operators, and *who announces cancellation* 🔴
**Ask: Barangay officials + boat operators**

1. What are the actual routes to/from Tumbod? **Is Liminangcong the main link?** (Research suggests yes — it has a real seaport and 5,814 people — but this is inference, not fact.) Is there also a direct route to Taytay poblacion?
2. Operator names, departure times, days of week, typical crossing duration, fare.
3. **Do boats use Blockade Strait (1.1 km, west) or Endeavor Strait (0.2 km, east), and does that change with sea conditions?** These are the real named channels either side of the island. If boatmen distinguish them, the site should too.
4. **The critical one:** when a trip is cancelled, **who decides, and how does word currently spread?** Research found that the Coast Guard prohibits vessels ≤3 GT from sailing in Taytay and El Nido during rough seas — a municipality-wide binding ban, not an operator's judgment call. So:
   - Is cancellation usually a **PCG sailing ban**, or an **operator decision**, or **both**?
   - Who on the island learns first, and how? (Radio? A call from the pier? Facebook?)
   - **Could that person realistically update a website — or a single WhatsApp/SMS to the Secretary who then updates it?**

**Why blocking:** the "next boat" row is part of the signature element (spec §11). If no human being can realistically keep it current, we must design it differently — as a *published schedule plus a "confirm by calling this number" instruction* rather than a live status. Both are legitimate; building the wrong one wastes the most prominent space on the site.

---

## B5. Do you want online document requests at all? ✅ ANSWERED 2026-08-04
**Decision: (a) requirements only, architected for (b).**
Ship requirement checklists, fees, hours, and named responsible officer. No public form in v1. The `ServiceRequest` model, `residentId` FK, PII table separation, reference-number generator, and `Service.acceptsOnline` feature flag are all built and tested but dark. Turning requests on later is a config change plus a form, not a migration. Spec §18 remains in scope as *architecture*; only its UI is deferred.

**Original question retained below for record.**

**Ask: Punong Barangay + Secretary**

Two options:

**(a) Publish requirements only.** The site shows what to bring, the fee, processing time, hours, and who to approach. No forms. Residents still come in person, but nobody wastes a boat trip over a missing photocopy.

**(b) Requirements + online request.** A resident submits a request and gets a reference number; the Secretary processes it manually and the resident still collects in person. **It is not automated issuance** and the site will say so plainly.

If **(b)**: who monitors the queue, on what device, how often — and what happens when that person is off-island?

**Why blocking:** option (b) adds roughly 30% to scope — the form system, reference numbers, the tracking page, PII handling and encryption, the retention policy, rate limiting, and staff notification. It also creates an obligation: a request that goes unanswered for two weeks is worse than no request system. Build it only if someone will actually answer it.

**My recommendation: start with (a), architected for (b).** Ship requirements-only, with the data model and feature flag already in place. Turn (b) on once the barangay has seen the site working and knows who will staff it. Nothing is thrown away.

---

## B6. Who maintains this site in 18 months? ✅ ANSWERED 2026-08-04
**Decision: a named, willing Barangay Secretary with a smartphone.**
Full CMS per spec §15–§16 is confirmed in scope: phone-first admin, 5-minute announcement flow, two-tap sea/boat update, live homepage modules. Persona P3 (Aling Fe) is therefore a *real* person, not a design fiction — **her actual name, device, and comfort level are now needed** (see N16 below), and the 5-minute publishing test in §34 must be timed against her, not a simulation.

**New follow-up — N16 (non-blocking):** name, phone model, and whether she prefers Filipino or English in the admin UI. *Assumption until answered: mid-range Android, Chrome, Filipino admin UI.*

**Original question retained below for record.**

**Ask: you + Punong Barangay**

A named person. Their device (phone or computer?). Their comfort level with things like Facebook, Word, email.

Be honest — this answer changes the build fundamentally:
- **A named, willing Secretary with a smartphone** → full CMS, as specified.
- **"Whoever is Secretary at the time"** → CMS with much heavier guardrails, more static content, longer-lived pages.
- **"Nobody, realistically"** → we invert the design: near-zero maintenance, static content with long shelf life, no live modules that rot visibly, and an explicit "last reviewed" date policy so stale content is honest rather than misleading.

**Why blocking:** it determines the CMS choice (spec §15), the admin design (§16), and how much of the homepage can be live data. A live sea-condition module that nobody updates is worse than no module — it actively misinforms.

---

## B7. Hosting, domain, and who holds the keys 🔴
**Ask: you + municipality**

1. Who pays for hosting and domain — **barangay, municipality, or you**? What's the annual budget?
2. **Is a `.gov.ph` domain wanted?** It confers real legitimacy but requires DILG/DICT endorsement and takes time — start it now if yes, and ship on a fallback domain meanwhile.
3. **Who holds the credentials in year 2?** Named person plus a named successor.
4. Is the municipality willing to link to this site from `taytaypalawan.gov.ph`?

**Note from research:** `taytaypalawan.gov.ph` returned **HTTP 503 for at least 24 hours** on 2026-08-04. Whatever hosting arrangement the municipality uses, we should not inherit it. This is also the clearest possible argument for the offline-first architecture — and worth mentioning to the barangay, because it explains why this site is built the way it is.

---

# PART B — NON-BLOCKING (assumptions stated; correct them if wrong)

## N1. Purok names and count
*Assumption: placeholder `Purok 1…N`, flagged everywhere.*
Needed eventually for wayfinding, evacuation mapping, and purok-scoped announcements. Also: **is there a purok leader per purok, and are they contactable?**

## N2. Evacuation sites
*Assumption: placeholder, `/ligtas/likasan` ships with a visible "hindi pa kumpleto" state.*
Needed: name, location, capacity, who holds the key, whether it is reachable in a storm. **Given the November 2025 landfall at Batas with >3 m surge, this deserves to be treated as near-blocking** — I have left it non-blocking only because the page can honestly ship incomplete and be filled later.

## N3. Fee schedule and enabling ordinance
*Assumption: placeholder fees, flagged; the ordinance citation is left blank rather than guessed.*

## N4. Office hours
*Assumption: Mon–Fri 08:00–17:00, flagged.*
Also: **do hours change during habagat or typhoon season?** The office-status badge computes from this, so seasonal variation needs modelling if it exists.

## N5. Seal / logo assets
*Assumption: trace the Facebook profile image to SVG, marked unofficial pending replacement.*
Vector source preferred. Does an official seal design exist on paper?

## N6. Existing photography and licensing
*Assumption: no usable licensed photos; ship with chart-based and typographic compositions and zero stock photography.*
The MLGU Taytay Facebook page has a "Project Turn Over at Barangay Tumbod" video — municipal-sourced imagery may have a cleaner permission chain than resident photos.

## N7. Officials' contact numbers
*Assumption: office line only — the privacy-safe default. No personal mobile numbers published.*

## N8. Data privacy
*Assumption: no existing DPO or privacy notice; we draft one in Filipino and English (spec §24).*
Under RA 10173 this matters more if you choose B5(b).

## N9. Analytics
*Assumption: self-hosted, cookieless, no third-party requests.*

## N10. Language default
*Assumption: Filipino default, complete English mirror.*
Worth asking: **is the local language Tagalog/Filipino, or is Cuyonon or another language commonly spoken?** Palawan is linguistically mixed. If residents' first language isn't Filipino, that changes the copy — and possibly adds a third locale.

## N11. "No land border" — may we state it categorically?
*Assumption: we say "an island barangay reached only by boat" (well supported) and avoid the categorical claim until confirmed.*
Research checked 5 of 31 Taytay barangays; none besides Tumbod resolve to Tuluran, and Wikipedia states Tuluran is "also called Tumbod." Strong, not conclusive. **Can the barangay simply confirm that Tumbod is the only barangay on the island?**

## N12. Tumbod's MSPLS zone
**Ask: PCSD / DENR-BMB / MSPLS PAMB, or the barangay**
*Assumption: omitted from v1.*
Which MSPLS zone(s) — core, buffer, multiple-use — cover Tumbod's waters, and what fishing rules apply where? This is potentially one of the most genuinely useful pages on the site for a fishing community, and nobody currently publishes it in a readable form. Strong candidate for v1.1 if not v1.

## N13. *Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod*
*Assumption: omitted until confirmed.*
The brief names this people's organization as party to conservation agreements. **Desk research found no source.** Does it exist, is it active, and does it want a presence on the site?

## N14. Connectivity and power on Tuluran today
*Assumption: worst case — intermittent 2G, scheduled power. This is already what the architecture assumes, so the answer changes nothing structural.*
Useful for right-sizing the offline cache: which carrier works, roughly what speed, is there a wifi point, is electricity 24 h?

## N15. Barangay history
*Assumption: the History page ships minimal and honest rather than padded.*
One source says Tumbod was created in 1972 — unconfirmed. Is there a founding story, a name origin, or elders who could give 200 words? **This is the cheapest possible way to make the site un-generic**, and no other barangay can copy it.

---

# PART C — QUESTIONS RESEARCH RAISED THAT THE SPEC DIDN'T ASK

## C1. Is reef health a live local issue?
Published data: Tumbod's reef fish biomass is **41.94 MT/km²** against Liminangcong's **59.94 MT/km²** — meaningfully lower next door. 630 coral colonies have been replanted across the two barangays.
**Do residents know this? Is it discussed?** If yes, marine content is household economics, not an About-page decoration, and should be given real surface.

## C2. Do residents distinguish the two straits?
Blockade Strait (1.1 km) and Endeavor Strait (0.2 km) flank the island. **Are these the local names, or chart names nobody uses?** If local, they belong in the interface. If not, we use whatever residents actually say. This is exactly the kind of detail that separates a site *of* Tumbod from a site *about* Tumbod.

## C3. Is the barangay aware of BarangayOS and similar platforms?
Free multi-tenant SaaS platforms for Philippine barangays exist, offering document requests and GCash/Maya payments. They are also precisely the generic-template outcome the client rejected twice.
**The barangay should make this choice knowingly.** I can prepare a one-page honest comparison — what a custom site gives that a platform doesn't, and what a platform gives that we would have to build. Say the word.

## C4. SMS instead of, or alongside, the website?
Philippine barangay information systems consistently use **SMS** as the resident notification channel. For a population with intermittent data, an SMS blast for typhoon advisories may reach more people than any website.
**Is there budget or an existing mechanism for SMS?** If so, the website's role shifts slightly — it becomes the permanent record and the detail view, with SMS as the alert channel. That is a better system, and it changes what the homepage emphasises.

---

# PART D — FALLBACK IF B1 CANNOT BE ANSWERED

If nobody can extract the Facebook page, I propose this substitute evidence base, **declared openly in `DESIGN-PLAN.md` rather than disguised as research**:

1. **Colour** sourced from documented physical referents in Malampaya Sound and Palawan *bangka* painting conventions, each stated with its referent — satisfying spec §8.2's sourcing rule, but from the place rather than from the page. Every colour still carries a written source; none is justified by "it looked good."
2. **Voice** modelled on published Philippine barangay and LGU communication conventions, written plainly in Filipino, and **explicitly marked for review by the Secretary before launch** — with the review built into `CONTENT-TODO.md` as a launch blocker.
3. **Content taxonomy** derived from the specification's default categories, with the homepage module order marked **provisional pending the first 30 days of real posting** — and re-ordered after launch based on what actually gets posted.

This is a legitimate path. It is weaker than the specified one, and the weakness is recorded rather than hidden. **It must be an explicit decision by you**, not a default we slide into.

---

# SUMMARY — WHAT I NEED TO PROCEED

| # | Need | From | Blocks |
|---|---|---|---|
| B1 | Facebook extraction worksheet | page admin | palette, voice, taxonomy, homepage order |
| B2 | Officials roster + photo consent | Secretary | Officials page |
| B3 | Verified hotlines | Secretary / BDRRMC | `/ligtas` — highest priority page |
| B4 | Boat routes + who announces cancellation | officials / operators | the signature element |
| B5 | Online requests: yes or no | Punong Barangay | ~30% of scope |
| B6 | Named maintainer | you / Punong Barangay | CMS selection, live modules |
| B7 | Hosting, domain, credentials | you / municipality | deployment, `.gov.ph` timeline |

**Answer B5 and B6 and I can start Phase 3 design on assumptions for the rest** — those two determine architecture. The remaining five determine content, and content placeholders are already designed for (spec §0.2).

---

**END — DISCOVERY-QUESTIONS.md**
