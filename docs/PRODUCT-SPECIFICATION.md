# Product Specification

## Quran Platform — Reader-first Product Specification

**Version:** 1.0  
**Status:** Draft for design and engineering  
**Working brand:** Quran Platform

---

## 1. Product Information Architecture

### Primary navigation

**Web**

- Home
- Read Quran
- Search
- Bookmarks
- Reading activity (later)
- Profile / Settings

**Mobile**

- Home
- Quran
- Bookmarks
- Activity (later)
- Settings

Keep the reader one tap away from the main navigation. Do not make account creation a prerequisite for reading.

### Reader information hierarchy

1. Surah identity and metadata.
2. Optional reading position/context.
3. Arabic ayah.
4. Translation (toggleable).
5. Ayah actions: bookmark, play, share/copy reference, note (later).
6. Navigation to previous/next ayah or surah.

## 2. Core User Journeys

### Journey A — Read without an account

1. User opens the app.
2. User selects a surah from the index.
3. App loads the surah metadata and ayah content.
4. User adjusts text size/theme if needed.
5. User reads and navigates.
6. Local last-read position is saved on the device.

**Success:** User can begin reading without registration or unnecessary onboarding.

### Journey B — Bookmark an ayah

1. User opens ayah actions.
2. User selects Bookmark.
3. App confirms the bookmark state.
4. Bookmark appears in the bookmark list.
5. User can open or remove it.

For anonymous users, save locally. When an account is later connected, offer a clear merge/sync policy.

### Journey C — Resume reading

1. User opens Home or Reader.
2. App shows a “Continue reading” entry when a valid position exists.
3. User selects it.
4. Reader opens the correct surah and ayah.
5. Position updates after meaningful navigation or an explicit save.

### Journey D — Search

1. User chooses a supported search mode: Arabic, translation, or surah.
2. User enters a query.
3. App displays loading, results, or a helpful empty state.
4. Each result identifies surah and ayah.
5. Selecting a result opens the reader at that ayah.

Search must not imply semantic religious interpretation unless a separately designed, sourced feature is introduced.

## 3. Screen Specifications

### 3.1 Home

**Purpose:** provide a calm starting point and a fast path back to reading.

Components:

- Greeting or neutral welcome.
- Continue reading card (if available).
- Browse surahs entry.
- Daily reading goal/progress only when enabled.
- Optional daily ayah feature only after content sourcing and editorial policy are defined.

States:

- First visit: prominent “Start reading” action.
- Returning visitor: continue reading.
- Offline: show cached/available content status without blocking reading.
- Loading/error: skeleton and retry; reader navigation remains available where cached.

### 3.2 Surah Index

Components:

- Search/filter input.
- List of 114 surahs.
- Surah number, Arabic name, transliterated name, translation of name, verse count, and revelation classification only when verified.
- Optional grouping or navigation by juz.

Behavior:

- Search by supported surah fields.
- Selecting an item opens the surah reader.
- Preserve scroll position when returning from reader.

### 3.3 Quran Reader

**This is the highest-priority screen.**

Components:

- Surah header and navigation.
- Reading content with Arabic text.
- Translation below or in a configurable layout.
- Ayah number and actions.
- Reader settings entry.
- Previous/next navigation.
- Optional progress indicator that does not distract.

Settings:

- Arabic font size.
- Translation font size.
- Translation visibility.
- Light/dark/warm theme if validated.
- Line spacing and content width where useful.
- Preferred translation.
- Optional transliteration, clearly distinguished from Arabic text and translation.

Rules:

- Arabic content uses right-to-left direction and suitable shaping/font support.
- Preserve diacritics and avoid unsafe truncation.
- Do not split or reorder ayah content incorrectly.
- Any page/mushaf mode must use a verified page layout source; do not infer canonical page breaks from arbitrary responsive text wrapping.
- Reader controls should be accessible and have clear labels.
- The app should not insert ads, unrelated recommendations, or pop-ups into reading content.

### 3.4 Bookmarks

Components:

- Saved ayah reference.
- Optional user label/note (later).
- Created/updated date where useful.
- Open and remove actions.

Rules:

- Bookmarks are private.
- Duplicate bookmark behavior should be deterministic (prefer one bookmark per user and ayah unless collections are later introduced).
- Removing a bookmark requires clear feedback and an undo opportunity where practical.

### 3.5 Search

Supported modes for MVP:

- Surah name and metadata.
- Arabic exact/partial search if the index supports correct normalization.
- Translation text search for the selected translation.

Search considerations:

- Arabic normalization must be documented (diacritics, alef variants, ya/alif maqsura, hamza forms) and tested.
- Do not silently normalize in ways that create misleading results.
- Results must preserve exact source text and identify the translation/source.
- Add rate limits and query length limits.

### 3.6 Settings

- Theme.
- Arabic and translation text sizes.
- Preferred translation.
- Audio preferences (later).
- Language.
- Privacy and account controls.
- Download/offline management (later).

### 3.7 Audio Player (P1)

- Play/pause.
- Reciter selection.
- Surah/ayah playback where supported.
- Repeat current ayah or selected range if supported.
- Seek and progress.
- Background playback and lock-screen controls on mobile, subject to platform implementation.
- Handle missing audio, network interruption, and expired URLs gracefully.
- Show reciter and source attribution.

### 3.8 Tafsir (P1)

- Show tafsir for a selected ayah.
- Clearly label author/collection, language, edition, and source.
- Distinguish tafsir from translation and editorial summaries.
- Preserve source text and avoid AI rewriting as the canonical display.

### 3.9 Reading Activity (P1)

- Reading sessions and last-read position.
- Optional daily target.
- Progress is a personal aid, not a public score.
- Reminders are opt-in and configurable.
- Do not infer that a user completed reading merely because a page was opened.

### 3.10 Hifz and Murajaah (P2)

- User selects an ayah or range.
- Private status such as learning, memorized, needs revision.
- Revision schedule is a configurable aid, not a religious prescription.
- Log revision sessions.
- Provide manual controls and clear history.
- No public rankings.

## 4. Interaction and State Requirements

Every major screen must define:

- Initial/loading state.
- Loaded state.
- Empty state.
- Error state.
- Offline/partial availability state.
- Permission-denied state where relevant.

Actions should provide immediate feedback. Use optimistic updates only when rollback is reliable. User-owned writes must be retried safely and should not create duplicates.

## 5. Data Concepts

### Canonical/reference data

- Surah
- Ayah
- Juz/metadata
- Translation collection and translation text
- Tafsir collection and tafsir entry
- Reciter
- Audio asset

### User data

- User profile and preferences
- Bookmark
- Last-read position
- Reading session
- Reading goal
- Personal note
- Memorization item
- Revision session

Reference content and user-generated data must be separated. Each reference collection needs provider, version, language, license/attribution, and import metadata.

## 6. API Contract Principles

- REST API under `/api/v1`.
- JSON responses with stable identifiers.
- Validate request bodies, params, and query strings.
- Standard error envelope with machine-readable code and safe message.
- Pagination for lists.
- Explicit source/version metadata on content responses.
- Idempotency or deterministic upsert behavior for repeated user actions.
- Authorization checks on every user-owned resource.
- OpenAPI specification is the source of truth for API consumers.

Suggested response envelope:

```json
{
  "data": {},
  "meta": {
    "requestId": "opaque-request-id"
  }
}
```

Suggested error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed.",
    "details": []
  },
  "meta": {
    "requestId": "opaque-request-id"
  }
}
```

Do not leak stack traces, SQL details, tokens, or provider credentials.

## 7. Initial API Surface

### Public/reference content

- `GET /api/v1/surahs`
- `GET /api/v1/surahs/:surahNumber`
- `GET /api/v1/surahs/:surahNumber/ayahs`
- `GET /api/v1/ayahs/:surahNumber/:ayahNumber`
- `GET /api/v1/translations`
- `GET /api/v1/search`
- Later: `GET /api/v1/tafsirs`, `GET /api/v1/reciters`, `GET /api/v1/audio/...`

### Authentication

- `POST /api/v1/auth/register` (if first-party auth is selected)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`

### User-owned resources

- `GET /api/v1/me/bookmarks`
- `PUT /api/v1/me/bookmarks/:surahNumber/:ayahNumber`
- `DELETE /api/v1/me/bookmarks/:surahNumber/:ayahNumber`
- `GET /api/v1/me/reading-position`
- `PUT /api/v1/me/reading-position`
- Later: reading sessions, goals, notes, memorization, revision.

## 8. Design System Direction

**Visual direction:** premium, quiet, editorial, modern, respectful.

- Use generous spacing and restrained visual hierarchy.
- Let Arabic typography be the visual focal point.
- Use a neutral foundation with one restrained accent color.
- Avoid excessive gradients, ornamental overload, and dense dashboard cards.
- Use consistent type scale, spacing, radii, elevation, and interaction states.
- Ensure contrast and readability in both themes.
- Avoid decorative Arabic calligraphy where it reduces legibility or could be mistaken for Quran text.
- Test actual Arabic text, including diacritics, on real browsers and mobile devices.

Deliverables:

- Color tokens.
- Typography tokens (Arabic and Latin families).
- Spacing and layout tokens.
- Components: buttons, inputs, list rows, cards, dialogs, bottom sheets, reader controls, ayah actions, audio controls.
- Responsive breakpoints.
- Accessibility notes and interaction specs.

## 9. Analytics and Privacy Events

Collect only what is needed to improve reliability and usability.

Potential aggregate events:

- `reader_opened`
- `surah_selected`
- `bookmark_created`
- `search_submitted`
- `audio_playback_failed`

Avoid collecting raw notes, full search text, detailed religious behavior, or user-level reading histories in third-party analytics. Prefer aggregation, short retention, and explicit disclosure.

## 10. Acceptance Criteria for Reader MVP

- All 114 surahs appear with validated metadata.
- Ayah content matches the selected source and edition.
- Arabic shaping, diacritics, and RTL behavior are correct in the supported test matrix.
- Translation is clearly labelled and can be hidden/shown.
- Reader can navigate between surahs and ayahs.
- Reader settings persist locally.
- Bookmark add/list/remove works and is private.
- Last-read position restores correctly.
- Search results open the exact referenced ayah.
- Core reading remains usable if optional services are unavailable.
- No disruptive ads or interstitials appear in the reading experience.
- Critical paths pass automated and manual tests.

---

**End of Product Specification**
