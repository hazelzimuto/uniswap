# UniSwap — Peer-to-Peer School Uniform Marketplace
### Refined Product Concept

---

## 1. Original Idea (Summary)

A marketplace app where parents can buy, sell, or donate second-hand school uniforms directly with each other — inspired by Derby Grammar School's PTA second-hand uniform scheme, but generalised to any school. Users pick a school, filter by gender/size/condition, browse listings, pay by card or contactless wallet, and choose a courier (InPost, Yodel, Royal Mail, DPD, Evri) or free collection. One login gives access to both buying and selling.

This is a genuinely good idea — it solves a real, evidenced problem (the school's own site describes appointment-only, reception-based exchange as the *only* current option). But as written, it's scoped like a venture-backed marketplace startup, not a one-week build. Below are the gaps worth flagging before writing any code.

---

## 2. Gaps & Risks in the Raw Idea

### 2.1 Payments is the single biggest hidden cost
Taking Visa/Mastercard/Apple Pay from a buyer and paying out to an individual seller isn't "add Stripe." It's a **marketplace payments** problem:
- You need split payments (buyer pays £X, seller receives £X minus fee, on a delay, reversible if a dispute happens) — this is Stripe Connect / Adyen for Platforms territory, not a basic checkout integration.
- PCI-DSS scope, KYC on sellers (you're paying out to individuals — regulators care), and refund/chargeback handling.
- The school's real model splits proceeds 50/50 with the PTA. If you go peer-to-peer, does the PTA get cut out entirely, or does the app need a "donate my share to PTA" option? That's a business-model decision, not just a technical one.

### 2.2 Courier integration is many separate integrations, not one
InPost, Yodel, Royal Mail, DPD and Evri each have their own API, label format, pricing, and tracking webhook system. A real build would likely use a shipping aggregator (e.g. Shippo, Sendcloud, EasyPost) rather than five bespoke integrations — but even that's a paid, multi-week integration effort, not a weekend feature.

### 2.3 Trust & safety, because this involves children
This is the part I'd push back on hardest. Listings will reference a child's clothing size, and sometimes a name (school "house," initials sewn into blazers). Two strangers arranging to meet or ship items to each other, where the underlying context is a child, needs:
- No child photos/names in public listings (photograph the *garment*, not the child).
- Verified-parent signup (e.g. school email domain or PTA-issued invite code) rather than an open public marketplace — this also solves fraud/spam.
- A safe default: home delivery via courier or a public meet point (school reception, PTA sale event), never "meet at my house" as the default suggestion.
This isn't optional polish — it's the difference between a nice-to-have app and something a school would actually endorse.

### 2.4 Condition is subjective with no inspection step
The current school process works partly *because* the PTA physically checks items before resale. Peer-to-peer removes that checkpoint. You'll want a lightweight structured condition scale (e.g. "As New / Good / Fair," with required photos) and a simple dispute/return path, or trust will erode fast.

### 2.5 Multi-school scalability isn't just a dropdown
"Let parents pick a school" implies a school directory, each school's uniform policy (what's compulsory, house names, logo requirements), and ideally a way for a school/PTA to verify itself so listings map to genuine parents. That's a whole onboarding flow in its own right — worth designing for, but not worth *building fully* in week one.

### 2.6 GDPR, and specifically children's data
UK GDPR has extra weight around data that touches children, even indirectly (a child's school, house, and size is personal data about a minor once linked to a named account). Worth deciding early: what's stored, what's shown publicly vs. only to the two matched users, and a data retention/deletion policy.

### 2.7 Scope vs. the assignment
Your assignment explicitly asks for a **simple, basic app** built and documented in a short window. The raw idea — real payments, five courier integrations, multi-school directory, ratings, dispute resolution — is a 3–6 month product, not a ship-log task. The fix isn't to shrink the *idea*, it's to design deliberate phases and build Phase 0 properly.

---

## 3. Refined Idea

**One-line pitch:** A verified-parent marketplace where school uniforms are listed, filtered, and reserved online instead of requiring a Wednesday-afternoon appointment at reception — starting with browse/list/reserve, with payments and courier booking added as later phases.

**Two-sided from login:** every account can toggle between *Buy* and *Sell* — no separate account types.

**Core user flows:**
1. **Sell:** parent lists an item — school, item type, gender, size, condition, photos, price *or* mark as donation.
2. **Buy:** parent picks their school, filters by gender/size/type/condition/price, views listings, reserves/buys an item.
3. **Fulfilment:** buyer and seller agree delivery (courier, or free collection at school) — full carrier booking is a later phase.
4. **Donations:** items marked "donate" are free to claim, buyer covers delivery only (mirrors the PTA's real donation model).

---

## 4. Phased Scope

| Phase | What's included | Why |
|---|---|---|
| **Phase 0 — Ship Log MVP (this week)** | Single school (Derby Grammar), account with buy/sell toggle, create/edit listing with photos, browse + filter (gender, size, item type, condition, price), reserve an item (no real payment), simple "mark as sold/collected" status | Proves the core loop end-to-end without building payments or logistics |
| **Phase 1** | Real payments via a marketplace payment provider (e.g. Stripe Connect), in-app messaging, condition photo requirements, donation flow with PTA split option | Once the core loop is validated |
| **Phase 2** | Multi-school directory + verification, courier booking via a shipping aggregator, ratings/reviews, dispute handling | Scale-out |

**Recommendation for this week's submission:** build Phase 0 only, but document Phases 1–2 in the README as "Future Roadmap" — this shows the strategic thinking without over-building against the brief.

---

## 5. Decisions I'm Assuming (flag if you disagree)

- Single school (Derby Grammar School) for the MVP, not a school picker — multi-school is Phase 2.
- "Reserve" replaces "buy" for now — no real payment processing in the MVP.
- Delivery is a text field/preference selector in the MVP, not live carrier booking.
- Sellers can mark an item as a **donation** (free) or **for sale** (paid), matching the school's real donate vs. 50/50-sell distinction.
- No child names or photos in listings — item photos only.

---

## 6. Suggested Tech Stack (kept deliberately simple for the MVP)

- **Frontend:** React (single-page app)
- **Backend/DB:** Lightweight — e.g. a simple Node/Express API + SQLite/Postgres, or a BaaS like Supabase/Firebase to move fast for a one-week build
- **Auth:** Basic email/password or magic link (skip social login/KYC for MVP)
- **Image storage:** Simple cloud bucket (S3-compatible) or Supabase Storage
- **Payments/Delivery:** Deliberately excluded from MVP — stubbed with a status field, real integration deferred to Phase 1/2

---

## 7. Next Steps

1. Confirm the Phase 0 scope above (or adjust it).
2. Sketch the data model: `User`, `Listing`, `School` (single row for now), `Reservation`.
3. Wireframe three screens: Browse/Filter, Listing Detail, Create Listing.
4. Build, then write README.md and journal.md documenting the decisions made here.
