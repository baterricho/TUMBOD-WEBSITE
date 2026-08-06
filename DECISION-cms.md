# DECISION — CMS

**Date:** 2026-08-04
**Status:** ~~recommendation~~ **SUPERSEDED 2026-08-06 — see the addendum at the end**
**Reverses:** BUILD-PROMPT.md §15, which recommended Payload/Sanity and explicitly ruled out git-based CMS

> **The Sveltia recommendation below was NOT taken.** The owner chose a
> database-backed admin with its own login on 2026-08-06. The analysis is kept
> intact because it is still the correct analysis of the trade-off, and because
> the reason it was overruled is worth recording. Skip to the addendum for what
> was actually built.

---

## I got this wrong in the spec, and here is the correction

`BUILD-PROMPT.md` §15 says:

> **Not recommended:** git-based CMS (a broken commit takes the site down and Aling Fe cannot recover it)

**That reasoning does not survive contact with the architecture we actually built.**

On a static site behind a CI gate, a broken commit **cannot** take the site down. The build fails, the deploy never happens, and the previously deployed version stays live and untouched. The failure mode I was guarding against does not exist here. I ruled out the best option for this barangay on a premise that turned out to be false.

---

## What changed

Three things, none of which were settled when §15 was written:

1. **The framework changed.** We are on static Astro, not Next + Postgres. A database-backed CMS now means running and paying for a server that the rest of the architecture does not need.
2. **B7 is unanswered.** Hosting and domain funding are still unknown (`DISCOVERY-QUESTIONS.md`). Recommending a stack with a monthly server and database bill, to a barangay that has not confirmed it can pay for a domain, is not a neutral choice.
3. **B6 is answered.** A named Secretary with a smartphone will maintain the site. She needs a good editing experience — she does not need Postgres.

---

## Recommendation: Sveltia CMS (or Decap CMS), git-backed

Both run **entirely in the browser** against the GitHub repository. No server, no database, no monthly cost.

| | Git-backed (Sveltia/Decap) | Payload + Postgres |
|---|---|---|
| Monthly cost | **₱0** | server + DB hosting |
| Server to maintain | **none** | yes, and someone must patch it |
| Works on a phone | **yes** (Sveltia is built mobile-first) | yes |
| Content survives platform change | **yes — it is Markdown in the repo** | export required |
| Full version history | **yes, free, it is git** | needs building |
| Broken content takes site down | **no — CI blocks the deploy** | possible |
| Editorial workflow / approval | yes, via pull requests | yes |
| Custodian burden in year 2 | **near zero** | real |

**Sveltia over Decap:** Decap is minimally maintained and its mobile experience is poor. Sveltia is a modern drop-in replacement with the same config format, a much better editor on a phone, and it does not require a separate auth server for GitHub.

**Why this fits the actual constraints:** the deciding factor is not editor features, it is **who is still paying and patching in year 2** (`DISCOVERY-QUESTIONS.md` B6/B7). The answer here is nobody, and nothing breaks. That is the correct outcome for a barangay of 1,744 people.

---

## What it does not solve

Honest limits:

1. **The Secretary needs a GitHub account.** One-time setup, done for her. She never sees git — she sees a form.
2. **Publishing takes ~60–90 seconds** (commit → CI → deploy), not the 10 seconds §15.3 specified. **Acceptable for announcements. NOT acceptable for a typhoon advisory.** See below.
3. **No true real-time.** Fine — nothing on this site needs it except advisories.

## The advisory exception — this is the important part

A typhoon warning must not wait 90 seconds for a CI pipeline.

**Advisories and sea/boat status do not go through the CMS.** They are fetched client-side from a single small JSON file on edge storage (Cloudflare KV, or a GitHub Gist as a zero-cost fallback), updated from a dedicated two-tap admin form. The static page renders the last known state at build time; the fetch upgrades it. This keeps the emergency path off the build pipeline entirely, and it still works offline from the service-worker cache with the staleness warning already implemented.

That is a small addition — one JSON endpoint and one form — not a second CMS.

---

## Proposed shape

```
src/lib/cms/
  source.ts        adapter interface — the ONE boundary content passes through
  static.ts        current implementation: the fallbacks in lib/content
  markdown.ts      Astro content collections, git-backed
public/admin/
  index.html       Sveltia CMS entry
  config.yml       collections, matching lib/content/types.ts exactly
```

Every validation rule from §15.2 carries over as a CMS field constraint: an `Ordinance` cannot publish without `plainSummary_fil`; an `Advisory` cannot publish without `expiresAt`; an `Official` photo requires `photoConsent`.

RBAC maps to GitHub repository roles: Secretary = write with PR required; Punong Barangay = approve and merge; Administrator = admin. The audit log is the git history — which is a stronger transparency claim than anything we would have built.

---

## Ask

Approve the reversal and I will build it. If you would rather stay with the specified Payload + Postgres, say so and I will — but the barangay should first answer B7, because that choice carries a recurring bill and this one does not.

---

# ADDENDUM — 2026-08-06: Supabase, not Sveltia

**Status:** built and live.

## What changed

The owner asked for "an admin account for the website that can manage all the
works and update in the website… and it will reflect in the website". Two words
in that sentence decided it:

- **"account"** — Sveltia has no accounts of its own. It authenticates against
  GitHub, so the Barangay Secretary would need a GitHub account and the repo
  would need to exist on GitHub. **This folder is not a git repository at all**,
  so the recommendation above was not merely unbuilt, it was unbuildable as it
  stood.
- **"reflect"** — a git-backed CMS publishes through CI. That is 60–90 seconds,
  which the analysis above already flagged as unacceptable for advisories. The
  owner wanted it for everything.

## What was built

A Supabase project (`barangay-tumbod`, `ap-southeast-1` — Singapore is the
closest region to Palawan) holding thirteen collections that mirror
`src/lib/content/types.ts`, and a bespoke admin at `/admin`.

- **Auth:** Supabase email + password. First administrator seeded directly.
- **Authorisation:** row-level security, not application code. Anonymous
  visitors may `select` published rows and nothing else. Every write requires a
  session whose user has a row in `profiles`. A bug in the admin UI cannot
  widen that; Postgres refuses.
- **The admin UI is generated** from `src/lib/cms/collections.ts`. Thirteen
  hand-written list screens and thirteen hand-written forms would have drifted
  from the schema the first time a column changed.
- **Publishing is immediate.** No build step, no pipeline.

## What this costs that the git-backed option did not

Recorded honestly, because the analysis above still stands on its own terms:

1. **A live dependency.** The site now has a service that can be down, and an
   account that can lapse. Mitigated, not removed: every collection keeps its
   checked-in fallback in `src/lib/content/`, and the site renders that when
   the database is unreachable — which is exactly what the `ContentSource`
   boundary in `src/lib/cms/source.ts` was built for.
2. **Someone must still be paying attention in year 2.** The free tier pauses
   projects after a period of inactivity. That is the custodian problem the
   Sveltia recommendation was designed to avoid, and choosing this option does
   not solve it — it defers it.
3. **The audit log is weaker.** Git history is a stronger transparency claim
   than a `updated_at` column. If that matters to the barangay later, Postgres
   row-level audit triggers are the replacement, and they are not free to build.

## What was removed

`public/admin/index.html` and `public/admin/config.yml` — the Sveltia entry
point and its collection config. They pointed at `backend.repo: OWNER/REPO`, so
they could never have authenticated, and `public/admin/index.html` shadowed the
new `/admin` route at build time. Every validation rule they carried (an
advisory cannot publish without an expiry; an official's photo cannot exist
without recorded consent; a hotline records who verified it and when) is
reproduced in `src/lib/cms/collections.ts` and, where it can be, enforced in the
database rather than in a form.
