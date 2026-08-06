# FACEBOOK-EXTRACTION-WORKSHEET.md
## Manual extraction from the Barangay Tumbod Facebook page

**Why this exists:** automated extraction is blocked (`RESEARCH.md` §5.1). Facebook shows nothing to software that isn't logged in. This worksheet replaces that step.
**Page:** https://www.facebook.com/profile.php?id=61579831854802
**Who can do this:** anyone who can open the page in a browser. No technical skill needed.
**Time:** ~45 minutes for all of it. ~15 minutes for the minimum (marked ⭐).
**Spec reference:** BUILD-PROMPT.md §3.1

Fill in what you can. Blanks are fine — a partly-filled worksheet is far more useful than none. **Do not guess.** Write `hindi alam` / `not sure` where you don't know.

---

## PART 1 — BRAND ASSETS ⭐

**Save the files into a folder called `/brand-assets/` next to this document.** Download the actual image files where possible — right-click → Save image as. Screenshots lose quality, but a screenshot is better than nothing.

| Item | Save as | Done? | Notes |
|---|---|---|---|
| ⭐ Profile photo / seal, largest size available | `seal-original.png` | ☐ | Click the photo first so it opens full-size, *then* save |
| ⭐ Cover photo | `cover-original.jpg` | ☐ | |
| Any tarpaulin or poster image posted by the barangay | `tarp-1.jpg`, `tarp-2.jpg`… | ☐ | These show the colours and fonts residents already recognise |
| Any photo of the barangay hall | `hall.jpg` | ☐ | |
| Any photo of the pier / boats | `boats-1.jpg`… | ☐ | Aim for 3–4. **These matter a lot** — see Part 2 |

**Questions about the seal:**

- Is it a scan of a printed seal, or a clean digital drawing? `________________`
- Does a vector file exist anywhere (`.ai`, `.svg`, `.eps`, `.cdr`)? Who would have it? `________________`
- What colours are in it? `________________`
- Any words or a motto on it? Write them exactly, including spelling: `________________`

---

## PART 2 — PHOTOGRAPHS FOR COLOUR ⭐

**This is the most valuable part of the worksheet and takes the least skill.**

The site's colour palette is supposed to come from what Tumbod actually looks like — the paint on the boats, the mangrove, the sea at midday — not from a designer's taste. We need real photographs to pull those colours from.

**⭐ Save 8–12 photos from the page that show:**

| What to look for | How many | Done? |
|---|---|---|
| ⭐ *Bangka* / boats — especially painted hulls and outriggers, close enough to see the colours | 3–4 | ☐ |
| ⭐ The sea and sky | 2 | ☐ |
| The pier / shoreline | 1–2 | ☐ |
| Buildings — barangay hall, health station, houses | 1–2 | ☐ |
| People at a barangay event (uniforms, tarpaulins in shot) | 1–2 | ☐ |
| Mangroves or trees | 1 | ☐ |

Save into `/brand-assets/photos/`. Original quality if you can.

**Then, in plain words — what colours do you see most on Tumbod's boats?**
(Don't be technical. "Bright yellow, sky blue, white with a red stripe" is exactly right.)

`_________________________________________________________________`

**Is there a colour people associate with the barangay?** (from the seal, tarpaulins, uniforms, or a basketball jersey)

`_________________________________________________________________`

---

## PART 3 — WHAT GETS POSTED ⭐

Scroll back through roughly the **last 30 posts** and count how many fall into each type. Rough counts are fine.

| Type of post | Count | Example (a few words) |
|---|---|---|
| ⭐ Announcement / abiso | ____ | |
| ⭐ Health / medical mission / bakuna | ____ | |
| ⭐ Relief goods / ayuda | ____ | |
| ⭐ Disaster or weather advisory | ____ | |
| Ordinance / resolution | ____ | |
| Event (fiesta, assembly, sports) | ____ | |
| Meeting minutes / session | ____ | |
| Congratulations / birthday / ceremonial | ____ | |
| Something else | ____ | |

**Roughly how often does the page post?**
☐ several times a week ☐ about weekly ☐ a few times a month ☐ irregularly, in bursts

**Date of the most recent post:** `____________`
**Date of the oldest post you scrolled to:** `____________`

**Which posts get the most comments and shares?** `_________________________________`

> **Why we ask:** this decides what goes near the top of the homepage and what content types the system needs. If half the posts are health outreach, "next health outreach" earns a prominent slot. If nothing is ever posted about ordinances, we don't build a heavy ordinance workflow.

---

## PART 4 — HOW THE BARANGAY TALKS ⭐

**⭐ Copy the first 2–3 sentences of the 10 most recent posts, word for word.** Keep the spelling, the capital letters, the emoji, everything. Do not clean it up — the point is to capture how the barangay actually writes so the website sounds like the same people, not like a government form.

```
1. ______________________________________________________________

2. ______________________________________________________________

3. ______________________________________________________________

4. ______________________________________________________________

5. ______________________________________________________________

6. ______________________________________________________________

7. ______________________________________________________________

8. ______________________________________________________________

9. ______________________________________________________________

10. _____________________________________________________________
```

**Quick observations:**

- Mostly Filipino, mostly English, or mixed? `________________`
- Any Cuyonon or other local language? `________________`
- Formal (`Ipinapaalam po`) or casual (`Guys, may medical mission bukas`)? `________________`
- How are officials referred to? (`Kgg.`, `Hon.`, `Kap.`, first names?) `________________`
- Lots of emoji, or few? `________________`
- **How does an urgent warning look different from a normal announcement?** (ALL CAPS? ⚠️? A different opening word?) `________________`

---

## PART 5 — FACTS BURIED IN POSTS

Anything you spot while scrolling. All of it saves us a separate round of questions.

**Officials named in posts** (name + position, exactly as written):
```
____________________________________________________________
____________________________________________________________
____________________________________________________________
```

**Phone numbers that appear** (and what each is for):
```
____________________________________________________________
____________________________________________________________
```
> ⚠️ We will **not** publish any number until someone confirms it is current and answered. Numbers found here are leads, not facts.

**Purok names mentioned:** `_________________________________________`

**Place names mentioned** — pier, school, health station, chapel, evacuation site, sitios:
```
____________________________________________________________
____________________________________________________________
```

**Boat operators, departure times, or fares mentioned:**
```
____________________________________________________________
```

**Organizations that appear** (DSWD, DOH, PCSD, NGOs, municipal offices):
```
____________________________________________________________
```

**Is *Samahan ng mga Nagkakaisa sa Kaunlaran ng Barangay Tumbod* mentioned anywhere?**
☐ yes ☐ no ☐ not sure — If yes, in what context? `________________________`

---

## PART 6 — WHAT RESIDENTS ASK IN THE COMMENTS

**This is quietly one of the most valuable parts.** Read the comments on the 10 most recent posts. Write down the actual questions people ask.

```
1. ______________________________________________________________
2. ______________________________________________________________
3. ______________________________________________________________
4. ______________________________________________________________
5. ______________________________________________________________
6. ______________________________________________________________
7. ______________________________________________________________
8. ______________________________________________________________
```

**Which question comes up over and over?** `___________________________________`

> **Why we ask:** these questions become the website's FAQ, its service-page headings, and what the search box is tuned to find. A question asked three times in the comments is a question the website should answer before anyone has to ask a fourth time.

---

## PART 7 — PAGE BASICS

| Field | Value |
|---|---|
| Exact page name as displayed | `____________________` |
| Category shown under the name | `____________________` |
| "About" / intro text — copy it exactly | `____________________` |
| Address listed | `____________________` |
| Phone listed | `____________________` |
| Email listed | `____________________` |
| Follower count (approx.) | `____________________` |
| When was the page created, if shown? | `____________________` |
| Who runs the page day to day? | `____________________` |
| Is there any *other* Tumbod page or group? | `____________________` |

---

## WHEN YOU'RE DONE

Save this file and the `/brand-assets/` folder together. Partial is fine — send what you have.

**The ⭐ items alone unblock the design phase.** Everything else improves it.

If you can only do one thing: **Part 2 (photos) and Part 4 (how the barangay talks).** Those two are what make the site look and sound like Tumbod instead of like every other barangay website.

---

**END — FACEBOOK-EXTRACTION-WORKSHEET.md**
