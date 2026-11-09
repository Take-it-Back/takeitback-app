# Texas app store age law (SB 2420)

In force since June 4, 2026. Not legal advice; a lawyer should confirm before launch.

## What it asks of app developers
- Give each app (and in-app purchase) an age rating and pass it to the stores.
- For new Texas accounts, get the person's age range from the store (Apple: Declared Age Range API; Google: Play age signals)
  and use it to apply age limits.
- For minors: parental consent through the store before download or purchase, consent again after a "significant change",
  and honoring a parent's withdrawal of consent (Apple sends a server notification).
- Use the age data only for this, send it encrypted, and don't keep it.
- Penalties up to $10,000 per violation; following the store's signal in good faith is a defense.

## What it means for Take it Back
Take it Back is now for adults only (18+, in the terms and on sign-up since Nov 9). With an 18+ store rating:
- Minors should not be able to download it in Texas, so the consent and significant-change steps should mostly not arise.
- We still need to read the store's age range for new Texas users and close the door if it says under 18. That needs a
  native call (Apple Declared Age Range on iOS 26, Google Play age signals) which the current Capacitor shell does not have.
  Plan: build it into the Phase 3 phone app, or as a small native plugin before the first store release.
- Treat terms, privacy policy and pricing changes as possible "significant changes" and log them.

## To confirm with a lawyer
Whether an 18+ rating plus an 18+ terms gate is enough, or the age-range check is required before the first Texas download.

Sources: Apple, "Update for Apps Distributed in Texas" (developer.apple.com/news/?id=sg176nne); Wiley, "State App Store
Accountability Acts Introduce New Obligations for App Developers"; MacRumors, June 3, 2026.
