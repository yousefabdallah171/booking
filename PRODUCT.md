# PRODUCT.md — Consultation Booking Platform

> **Format**: [impeccable.style](https://impeccable.style/) — paired with `DESIGN.md`
> to provide full product + aesthetic context for AI-assisted UI generation.
>
> Keep this file current as the product evolves.
> **Always reference both DESIGN.md and PRODUCT.md before generating any UI.**

---

## What This Product Does

A professional consultation booking platform for Youssef, a career/professional coach
in Egypt. Replaces a WhatsApp-based workflow with a self-serve web app.

Clients book individual 60-minute sessions or purchase multi-session coaching packages.
Youssef manages his calendar, reviews intake forms, enters Google Meet links, and
tracks revenue — all from an admin dashboard.

---

## Target Users

### Client (the person booking)
- Egyptian professional seeking career coaching or professional development
- Likely bilingual (Arabic primary, English secondary)
- Mobile-first but uses desktop for forms and payment
- Trusts professional service providers; skittish about confusing flows
- Expectation: clear pricing, simple booking, instant confirmation email

### Admin: Youssef (the consultant)
- Single operator — no team
- Manages schedule, pricing, and client relationships
- Needs to see: today's sessions, pending payments, unread intake forms
- Non-technical; the UI must be clear and never require documentation

---

## Brand Voice

| Tone | Examples |
|---|---|
| Professional | "Confirm your session" not "Book now!" |
| Warm | "We look forward to meeting you" not "Transaction complete" |
| Respectful | Use formal Arabic (أنت / حضرتك) — never slang |
| Direct | No filler text. Every word earns its place. |

---

## Language & Locale

- **Default locale**: Arabic (`ar`) — RTL, Noto Naskh Arabic
- **Secondary locale**: English (`en`) — LTR, IBM Plex Sans
- All UI text exists in both `messages/ar.json` and `messages/en.json`
- Currency displayed in EGP (and USD equivalent where relevant)
- Dates displayed in the user's locale format

---

## Key User Flows

1. **New client books a session**: Landing → Login/Register → Date picker → Slot →
   Payment (Paymob) → Confirmation email → Dashboard shows upcoming session

2. **Package purchase**: Landing → Login → Package tier selection → Intake form →
   Payment → Dashboard shows progress tracker

3. **Admin opens calendar**: Admin login → Calendar view → Select date →
   Generate slots or view existing → Delete/block as needed

4. **Admin enters Meet link**: Bookings view → Find confirmed session →
   Paste Google Meet URL → Save → Client's dashboard updates

---

## Design Anti-Patterns for THIS Product

- ❌ Showing prices in USD only — always EGP primary
- ❌ "Sign up for free" language — this is a paid professional service
- ❌ Social proof widgets, star ratings, testimonial carousels
- ❌ Countdown timers creating false urgency
- ❌ Aggressive upsell popups during the booking flow
- ❌ Hiding pricing until the last step
- ❌ English-only interfaces (Arabic is the default)
- ❌ Casual/informal Arabic — use formal register

---

## Success Criteria

- Client can complete a booking in under 3 minutes
- Admin can block a day and generate slots in under 1 minute
- Confirmation email arrives within 30 seconds of payment
- No booking is possible for an already-taken slot (integrity enforced at DB level)
- Dashboard is usable on a 375px mobile screen
