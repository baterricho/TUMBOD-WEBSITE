# PRECEDENT-SCAN.md
## What Philippine LGU and barangay websites actually do

**Owed since:** `RESEARCH.md` §5.3 flagged the precedent scan incomplete.
**Completed:** 2026-08-05. Sites fetched and read, not recalled.
**Purpose:** derive §35's anti-pattern list from observed practice rather than assertion, and answer a specific question — *what makes a barangay site feel alive?*

---

## 1. SITES REVIEWED

| Site | Why | Verdict |
|---|---|---|
| [quezoncity.gov.ph](https://quezoncity.gov.ph/) | **Gold Stevie, Innovation in Government Websites** — the best-regarded LGU site in the country | Genuinely good. Several things worth stealing |
| [taytaypalawan.gov.ph](https://taytaypalawan.gov.ph/) | The parent municipality | **HTTP 503 again** — down on 2026-08-04 *and* 2026-08-05 |
| [brgy.to/abra/bangued/agtangao](https://brgy.to/) | A real barangay-level page on a directory platform | Instructive failure |
| [barangayos.com](https://barangayos.com/) · [angbarangayko.com](https://angbarangayko.com/) · [barangayconnects.online](https://barangayconnects.online/) | The SaaS alternatives to building this | The generic-template outcome |
| [bantayanisland.info](https://bantayanisland.info/information/weather-bantayan-island/) | Non-LGU, but the closest analogue: a Philippine island where sea state decides travel | Directly validates our approach |
| [DILG FDP](https://www.dilg.gov.ph/issuances/mc/Revised-Implementing-Guidelines-on-the-Full-Disclosure-Policy-FDP-and-FDP-Portal/3871) · [Sto. Tomas, La Union](https://santotomaslaunion.gov.ph/barangays-full-disclosure-policy-of-local-budget-and-finances-bids-and-public-offerings/) | The actual legal obligation | **Produced a concrete compliance fix** |

---

## 2. THE HEADLINE FINDING — WE WERE RIGHT ABOUT THE CONDITIONS STRIP

The best LGU website in the Philippines puts **live environmental conditions in the header**: Quezon City carries quick-access air quality, weather, and heat index indicators above everything else.

That is the same structural decision as our sea-condition band, arrived at independently, by an award-winning team, for the same reason: *the thing that changes daily and affects what you can do today belongs at the top.*

Bantayan Island — the closest analogue to Tumbod anywhere online — does the same and goes further, leading with sea state, wave height and tides specifically for travel planning, then **deferring to PAGASA and the Coast Guard for the final call**. That is precisely the posture `/ligtas` takes.

**Conclusion:** the Living Chart Header and sea band are not an eccentric choice. They are the pattern the best precedents converge on, applied to the variable that matters here.

---

## 3. WHAT MAKES A SITE FEEL ALIVE — OBSERVED, NOT ASSUMED

This was the question worth answering. Comparing QC (feels alive) against the barangay directory page (feels dead):

| Signal | Quezon City | brgy.to barangay page | Tumbod today |
|---|---|---|---|
| **Recency** — dated items days old | ✅ news dated within 2 days | ❌ nothing dated | ⚠️ demo only |
| **Volume** — many items visible | ✅ dozens | ❌ near-empty tabs | ⚠️ demo only |
| **Faces** — photographs of real people | ✅ officials, events, programs | ❌ none | ❌ **none, blocked** |
| **Change** — something differs each visit | ✅ AQI/weather strip | ❌ static | ✅ sea band |
| **Named humans** | ✅ every councillor named | ❌ officials show "—" | ⚠️ demo only |
| **Task guides** | ✅ "QCitizen Guides" | ✅ document guides | ✅ service checklists |

**The finding: liveliness is a content property, not a design property.** Four of the six signals are content. The directory page fails not because it is badly designed but because nobody filled it in — it shows literal `—` where officials should be, and empty Contact and Q&A tabs.

**Our site is not "empty" because of design.** It is empty because the barangay has not yet supplied officials, hotlines, fees, or photographs. The demo build is the proof: same design, populated, and it reads as alive.

**Ranked, the highest-leverage things to make Tumbod feel alive:**
1. **Photographs of real people and events** — the single biggest gap, and the only signal we score zero on. Needs consent (`DISCOVERY-QUESTIONS.md` B2).
2. **Officials roster with names** — "—" is what dead looks like.
3. **Anything dated within the last month.**
4. Sea/boat status actually being updated — already designed, needs an operator (B4).

No amount of additional design work moves any of these.

---

## 4. WHAT WE SHOULD STEAL

**From Quezon City:**
- ✅ *Conditions in the header.* Already have it, better targeted.
- ✅ **Task-named service guides.** QC calls them "QCitizen Guides" and names them by the task — *business permits, medical assistance, flood preparedness* — not by document type. Our service pages already lead with the checklist; the naming lesson is worth applying to labels.
- ⚠️ *Program cards with photos.* Effective, but needs photography we do not have.

**From Bantayan Island:**
- ✅ **Explicit deference to PAGASA and the Coast Guard.** Already implemented, and their framing confirms it is the right register: inform, then point at the authority for the final call.

**From the DILG FDP** — see §6. This produced a real fix.

---

## 5. WHAT WE CONFIRMED WE SHOULD NOT DO

§35's anti-pattern list was previously asserted. It is now **observed**:

| Anti-pattern | Seen at |
|---|---|
| **Officials carousel** | Quezon City — a 38+ member carousel of councillor headshots. Even the award-winning site does this; it is the default, not a good idea |
| Hero banner image | Quezon City, and every SaaS platform |
| Three/four-card program grids | Quezon City |
| Stat-count row (`Population · Officials · News · Q&A`) | brgy.to — and the counts read as zero, which makes it worse than omitting them |
| Multi-tenant generic branding | BarangayOS, Ang Barangay Ko, Barangay Connect |
| Empty tabs showing `—` | brgy.to — **the failure mode our placeholder system exists to avoid** |

**On that last one:** brgy.to renders unknown officials as `—`. Ours renders `[[NEEDS DATA: pangalan… — source: Barangay Secretary]]`. Both are empty; only one tells you who can fix it. That difference is the whole argument for the placeholder system.

**Also confirmed:** the parent municipality's website has now been down for **two consecutive days**. Whatever hosting the municipality uses, we should not inherit it — and this is the plainest possible justification for the offline-first architecture.

---

## 6. CONCRETE FIX PRODUCED BY THIS SCAN

**Our Transparency page was non-compliant.** It listed five self-invented categories. The Barangay Full Disclosure Policy (DILG MC 2010-083, updated 2022) requires **seven specific documents**:

1. Barangay Financial Report
2. Annual Budget
3. Annual Procurement Plan
4. Summary of Income and Expenditures
5. Itemized Monthly Collection
6. List of Notice of Award
7. 20% Component of the IRA Utilization

Posting obligation: RA 7160 §352 — within 30 days of each fiscal year's end, in at least three conspicuous public places **and the LGU website**.

Fixed in `TransparencyView.astro`: the page now names all seven with their official wording, states the legal basis, and explains each in plain Filipino. This is compliance the barangay is legally required to meet, and no amount of design taste would have surfaced it.

---

## 7. VERDICT

The design holds up against the best precedent in the country, and converges with it on the one structural decision that matters most.

The gap is content, not design — and the honest response to "make it lively" is to get the officials roster, the hotlines, and photographs with consent, not to add visual noise. The demo build already demonstrates the design carries content well.
