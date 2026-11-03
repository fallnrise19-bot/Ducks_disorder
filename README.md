# Ducks & Disorder

**Pack real life. Decorate chaos.**

An offline-first Android packing and daily-life motivation game. Completing real-world tasks earns Duck Coins, spent on absurd collectibles that gradually overrun Axel's office. Unlike Under the Willow, this is **not** a house-renovation game. The original House Flipper 2 room screenshots are the intended backgrounds.

## Current baseline: 0.4.0 (Android version code 4)

- Small / medium / large boxes earn **50 / 100 / 175 Duck Coins**.
- Each box can be completed all at once or in quarters. Quarter rewards always sum to the full box value, and partially packed boxes are saved separately by size.
- Optional tiny starting prompts, with a button to try a different prompt.
- Sort a drawer/shelf and declutter a bag; add a personal packing task.
- Daily Life: water +5 (four per day), meals +10 (three per day), quick dishes +15 (one per day), dishwasher +20 (one per day).
- Weekly routines: Sunday laundry +65, Tuesday garbage +40, once per week each, claimable early in the same week.
- Optional Android reminders: water noon/4 PM/8 PM, food 1 PM/6 PM, dishwasher 9 PM, Sunday laundry 1 PM, Tuesday garbage 7 PM. Android's inexact alarms may be delayed.
- Room F-011 office shop: 20 **temporary emoji placeholder** collectibles across five price tiers. Purchasing deducts coins and keeps the item; wishlist displays coins and approximate large boxes remaining.
- Room test canvas displays owned item placeholders in provisional positions. **The user's real office screenshot and individual transparent PNG assets are not integrated yet.** No invented replacement room should be generated.
- Progress: completed boxes by size, daily boxes, lifetime earned coins, collectible counts, recent wins.
- Local offline progress saving and manual share/copy backup + restore. No accounts, AI, ads, or streak penalties.
- Existing test-version localStorage progress is retained after in-place updates via the same Android application ID. Uninstalling or clearing app data can erase progress; export a backup first.

## Build / installation

Repository Actions → a green **Android test APK** run → artifact **ducks-disorder-debug-apk** → **app-debug.apk**.

The debug APK is for testing and is not a signed Play Store release. Android SDK 35, Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3.

Application ID: ca.creativepixels.ducksdisorder

## Relationship to Under the Willow

Ducks & Disorder reuses the working *packing and daily-life mechanics* conceptually, with its own independent saved progress, application ID, and reward destination. Never overwrite or modify the Under the Willow game to implement features here.

## Next work

1. Confirm the current Android build is successful and test in-place upgrade / local saving.
2. Import the **actual** F-011 office screenshot from the user's provided room image.
3. Extract or create truly individual transparent PNG objects (do not claim combined opaque catalog sheets are game-ready PNG assets).
4. Calibrate placement, layering, scaling and occlusion on the real screenshot before expanding into additional rooms.
