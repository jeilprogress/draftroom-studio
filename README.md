# Draftroom · AU Studio

A private, static creative workspace for writers. A calm black/deep-navy home screen opens independent Messages, Calls, Lock Screen and X studios. Messages and Calls retain Classic and Liquid Glass-inspired previews; Lock Screen now uses iOS 18 Classic only.


## AU projects and the shared cast

New profiles and scenes use neutral **Character**, **Name** and **Username** placeholders. Reference screenshots, personal photos and identifying reference text are not bundled in the public site. Existing user-created content is kept intact.

The opening page is an AU project library: name a story and choose **Start AU**, add its characters, then continue to the existing studio dashboard. The dashboard and every studio show the active AU; **Switch AU** returns to the library. Each AU has separate Messages, Calls, Lock Screen and X drafts and separate IndexedDB attachment databases. Instagram Studio uses the shared Instagram profile fields alongside its own posts, stories, comments and DMs.

Create basic/full names, contact names/photos, X profiles and Instagram identities in the dashboard's **Characters** section. Saved characters are available in Messages sender/contact/group selectors, X author selectors, call contacts and notification senders. Updates propagate on opening a studio. A field deliberately changed inside a studio is retained as a historical override instead of being overwritten by subsequent shared-profile edits.

Existing unscoped browser drafts and media remain in their original storage and appear in **Recovered Draftroom AU**. The legacy workspace imports contact and X identities without deleting the original messages, IDs, posts or attachments. New AUs use new storage namespaces. An already-open tab remains bound to its original AU even if another tab switches projects. Each studio retains its portable JSON/media backup and image-export features. Browser storage is local to the device/browser, not a cloud account.

**Messages:** select the sender above the phone, type inside the phone's message field and press Enter or Send. The plus button uploads photos/videos directly. Long-press, double-click, or keyboard-focus a bubble and press Enter for Tapbacks, reaction attribution/removal, editing, deletion and ordering. **Conversation tools** reveals the secondary editor for timestamps, events, typing indicators and all legacy customization. The FaceTime outline matches the supplied proportions and adapts to the selected theme.

**X:** use the floating plus or timeline composer to post; the reply action opens a linked reply composer. Repost opens a character picker with Repost/undo and Quote Repost, including quotes of quotes. The phone composers support four mixed photo/video attachments. Likes, reposts and bookmarks toggle counts and hide zeroes. Text profile tabs filter Posts, Replies, Reposts and Media; Posts has a sorting dropdown. Relevant retains its dropdown, and View Quotes opens linked quotes. Continuous reply chains keep vertical connectors without internal horizontal borders; separate branches retain separators. **Advanced editing** preserves all detailed fields and saved-post tools.

Deleting an AU requires a dialog naming the project, an explicit **Delete Permanently** action and a Cancel button with initial focus. Deletion removes only that AU’s studio keys and attachment databases. Other open tabs cannot silently recreate a deleted AU.

Run **npm run test:au** for migration, independent project switching, shared character updates/historical overrides, direct phone interactions and image checks. **npm test** covers all six test suites. **npm run test:master** checks Instagram, X DMs, deletion and neutral defaults. If using installed Chrome instead of Playwright's downloaded browser, set **DRAFTROOM_BROWSER=chrome**.

## Instagram studio

[Open Instagram Studio](https://jeilprogress.github.io/draftroom-studio/instagram.html). The fifth dashboard tile opens shared-character owner/visitor profiles, editable bios/photos/private and verified flags, counts, Following/Follow/Requested scenes, profile grids and filtered media/repost tabs. Create image/video posts and carousels, move through media by swipe or arrows, like/save/repost and share posts into a simulated DM. Comments retain parent/reply relationships, expandable threads, editable attribution, timestamps and engagement. Double-click or long-press a comment for editing.

Stories support photo/video/text content, embedded shared stories, standard and Close Friends audiences, owner and eligible viewer layouts, highlights, reactions and story replies that open real saved AU conversations. Select the current viewer outside the phone; ineligible viewers cannot see Close Friends story content. Stories are fictional static scenes, not real account uploads or automatically expiring broadcasts. Inbox notes, one-on-one/group chats, media, message editing/reactions, receipts and ordering use the shared cast. Phone controls open focused creator dialogs; those dialogs are excluded from captures.

Instagram uses its own per-AU IndexedDB state/media store, portable JSON including character profiles and media, and PNG/JPG/clipboard screen or phone-frame exports. Capture freezes cover/contain image layouts to keep the exported crop consistent with the preview. No reference screenshot or reference person's photo is a starter asset. Instagram icons are original SVG recreations. Supporting official references: [Meta’s navigation update](https://about.fb.com/news/2025/09/in-india-instagram-debuts-a-reels-first-experience-for-its-mobile-app/), [DM editing and replies](https://about.fb.com/news/2024/03/instagram-dm-updates/), [Notes and group chats](https://about.fb.com/news/2022/12/sharing-features-on-instagram-notes-group-profiles-and-more/), [reposts](https://about.fb.com/news/2025/08/new-instagram-features-help-you-connect/). Supplied screenshots guide the visible version.

## X / Twitter studio

[Open X Studio](https://jeilprogress.github.io/draftroom-studio/x.html), the fourth home-screen tile. It is a fictional profile/post creator with a reusable character library; it does not connect to or publish on X.

**Characters:** Save a display name, username, bio, location, link, joined label, profile photo, header and following/follower counts. Blue verification and protected-account flags are independent, so either, both or neither can be displayed. Own-profile, Following, Follow and Requested button states, Follows you, optional Followed by text and a pinned post are editable. Profile photos are cropped square and headers to 3:1. New profiles become available in author selectors after Save character; saved profile edits update every linked post. The active unsaved character draft also survives reload.

**Posts and conversations:** Choose a saved author to create a post, reply, quote post or repost. Replies and quotes can reference existing replies and quotes as well as original posts. References remain linked, circular references are rejected, and deleted targets show unavailable-post placeholders. Post detail, profile, timeline and conversation-thread layouts are available in Light, Dim and Lights out appearances. Profiles can be exported with or without their posts for character introductions.

**Media and story details:** Up to four mixed photos/videos per post, single-image aspect choices, attachment reorder/remove, video playback and editable video-duration labels. Video stills are used for exports. Edit detail date/time, relative timeline time, replies/reposts/likes/bookmarks/views, and visual liked/reposted/bookmarked states. Pinned posts, reply-permission labels, translation labels, edited indicators, sensitive-media covers, and polls with two to four choices and editable vote results are included. Links, @mentions and hashtags are styled in post text and bios.

**Direct messages:** Bottom navigation now opens an inbox, real one-on-one conversations and group DMs within the current AU. Choose viewer and sender outside the phone, create a participant list, type into the phone composer, attach photos/videos, and edit/reorder/react to messages through contextual actions. Chat headers, profile introductions, encrypted/unencrypted labels, group avatars, timestamps, message previews and Seen receipts follow the supplied layouts. DMs and media survive reload, project export/import and AU switching. The reply action uses a revised outline based on the isolated icon reference. [X’s supporting DM documentation](https://help.x.com/en/using-x/direct-messages).

**Storage and pictures:** The X studio has its own IndexedDB draft and media storage, plus a localStorage fallback when IndexedDB is unavailable; fallback media stays in memory until a portable project is saved. Save project includes characters, posts, active drafts and original media; importing replaces only the X draft. PNG, JPG and image clipboard export support full-content crops, visible phone screenshots and phone frames. No proprietary X font is bundled. Counts, verification, privacy and interaction states are fictional editable visuals, not live account state.

Post detail crops have no X.com wordmark. Click a timeline/profile post to open its complete saved reply thread, including replies to replies; the post detail view also includes all descendant replies. Preview like/repost/bookmark buttons add one on selection and subtract one on deselection. Abbreviations such as 4.9K are expanded to an exact count when changed. Local X-style SVG action silhouettes are in `vendor/x-icons/`. Character relationship options include both blocked-account and blocked-by scenes; View posts reveals a blocked character's posts without unblocking them. These templates follow the supplied visual references rather than enforcing X's changing live-account blocking rules.

Research references: [X profile customization](https://help.x.com/en/managing-your-account/how-to-customize-your-profile), [post types](https://help.x.com/en/using-x/types-of-posts), [mixed media](https://help.x.com/en/using-x/how-to-post), [replies](https://help.x.com/en/using-x/mentions-and-replies) and [reposts](https://help.x.com/en/using-x/how-to-repost). Screenshot layout references were supplied by the user; their personal images are not bundled with the site.

Run `npm run test:x` for character save/reuse, badge/follow/count states, uploads, linked replies/quotes/reposts and cycle prevention, four-photo/mixed-video grids, playback/reload persistence, polls, twelve theme/layout PNG exports, JPG/clipboard/screen/frame options, project round trips, mobile layout and isolation from the other three studios. `npm test` runs all four studios plus AU project workflows.

## Lock Screen studio

[Open Lock Screen](https://jeilprogress.github.io/draftroom-studio/lockscreen.html), the third studio on the home screen. Messages and Calls code and drafts are kept separate.

- Classic iOS 18-style solid clock and notification layout, with wallpaper controls
- Independent Light/Dark notification appearance, including grouped cards, stack layers, Focus summaries, music cards and exported images
- Six reference-inspired solid vector clock presets: Rounded, Soft bold, Fine, Editorial serif, Stencil and Double outline
- Three numeral sets and adjustable weight, size and color; vector clock paths use natural proportions without stretching, glow or blur
- Editable date/inline widget line and 12 widget types: weather, temperature, battery, activity rings, calendar, alarm, world clock, reminders, stocks, sunrise, moon and custom; a four-space row below the clock
- Six original wallpaper presets, photo uploads, zoom/position/dim controls and an optional transparent foreground upload for layered depth
- **49 bundled app icons** (39 App Store entries and 10 system-app illustrations), plus live App Store search and custom app/icon uploads
- App-specific presets for Messages/group texts/media, missed calls, FaceTime, X posts/replies/quotes, Instagram DMs/story mentions/likes, Facebook interactions and Discord messages; arbitrary editable notifications for any other app
- Sender/title/subtitle/body/time/count, Time Sensitive labels, sender photos and thumbnails; duplicate, reorder and delete controls
- Contact-led notification layout with a circular sender photo and small app badge at its lower-right corner
- GCash money-received preset with editable PHP amount, sender name and reference number, plus a random 13-digit reference generator
- List, grouped Stack and Count layouts, expandable groups, notification privacy previews and optional Notification Center title
- Do Not Disturb, Sleep, Work, Personal, Driving or custom Focus, including an expandable silenced-notification summary and dimmed Always-On appearance
- Carrier/network/battery/charging, lock symbol, Dynamic Island/notch, selectable and clickable bottom shortcuts, and a visual Now Playing card
- Independent browser draft, portable JSON backup/import, screen or phone-frame PNG/JPG and clipboard image copying

Clock styles are reference-based web recreations using openly licensed Nunito, Inter and Bodoni Moda numeric outlines and local numeral fallbacks. They do not bundle Apple fonts or claim pixel-identical Apple typography. The transparent foreground upload provides the depth layer. The phone picture captures the visible part of the notification list; scroll the preview to choose which cards are visible. Widgets and notifications are fictional editable values, not live account data or installed apps. App Store search sends only the typed app query to Apple; selected remote icons are embedded locally when available. See `vendor/lock-apps/NOTICE.md` for artwork provenance.

Design references: [Apple Lock Screen customization](https://support.apple.com/en-am/guide/iphone/-iph4d0e6c351/ios), [Apple Lock Screen features and notification views](https://support.apple.com/en-ph/guide/iphone/-iphcd5c65ccf/ios), and [Apple Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html).

Run `npm run test:lockscreen` for its browser checks. Set `LOCKSCREEN_LIVE_SEARCH=1` to additionally verify Apple's live JSONP search and icon embedding; the normal test deterministically checks that integration at its network boundary. The test covers clocks, notification templates/grouping/privacy, all widget types and capacity, Focus, music/shortcuts, uploads/depth, persistence/project round trips, real image downloads and clipboard copying, mobile layout and preservation of the other drafts. It also checks visible clock pixels in the Classic PNG.

[Open Draftroom](https://jeilprogress.github.io/draftroom-studio/). GitHub Pages publishes the configured repository source; no application build is required. The project home is `index.html`, the studio dashboard is `dashboard.html`, Messages is `messages.html`, and Calls is `calls.html`. Keep these pages with their adjacent CSS/JS files, `.nojekyll`, and `vendor/`.

## Home and Calls

The Draftroom wordmark and top-right Home link return to the studio picker. The Messages studio retains its existing editor, previews and storage key. Calls uses a separate `draftroom-calls-v1` browser draft; navigating between studios does not replace either draft.

The Calls studio includes:

- Classic and Liquid Glass-inspired interfaces, with graphite, ocean, plum and color-poster backgrounds
- Outgoing/calling, incoming/ringing, connected and ended screens
- Saved-contact name, number label and uploaded photo, or an editable unknown phone number with a fictional example-number generator
- Editable phone time, battery percentage and static call duration
- Independent clickable speaker and mute states, also reflected in the settings panel and saved picture
- Slide/click to answer, accept/decline, end and call-back visual transitions
- FaceTime Audio selection, visual keypad, hold notice and reminder/message visual feedback
- Screen-only or phone-frame PNG/JPG export and image clipboard copying

These are fictional screen controls. No real calls, microphone/camera access, notifications, messages or reminders are initiated.

## Features

- One-to-one and group conversations, participants and contact photos
- Text, photos, playable videos, timestamps, system events and typing indicators
- Reorder, duplicate and delete messages; delivery/read receipts and Focus status
- Blue media-save/share controls beside photos and videos; red Not Delivered labels and warning icons on outgoing text or media, including consecutive failures
- Below-chat Focus notice with crescent, contact name and visual Notify Anyway control; Delivered Quietly receipts
- Independent day/night previews, blue/green bubbles, wallpapers and glass tint
- Browser draft persistence and portable JSON projects including media
- Save image preview with PNG, JPG and image clipboard copying; a clean conversation crop, full screen or phone frame
- Existing phone and full conversation PNG shortcuts, with a local html2canvas 1.4.1 copy
- Consistent Apple emoji artwork in previews and saved images, including skin tones, flags and joined sequences
- Responsive layout, keyboard controls and reduced-motion support

## Design and fonts

Classic uses solid blue/green and neutral bubbles, compact contact navigation and native-style text metrics. Liquid Glass uses floating translucent navigation and composer controls over muted wallpaper, preserving readable bubbles. The iOS 27 option is an original web approximation, not an official Apple implementation or a claim of pixel-perfect fidelity. See [Apple's design overview](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/).

The system font stack uses -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica and Arial. No proprietary font files are bundled. Apple emoji artwork is supplied as a local image sheet from emoji-datasource-apple 16.0.0; Unicode stays unchanged in editable text and saved projects. Unmapped emoji and image-loading failures fall back to the device's native rendering. See vendor/emoji/NOTICE.md for artwork rights and the separate MIT data license.

The Liquid Glass contact header follows a centered photo above a separate name capsule. Bubble tails use curved SVG paths that also render in saved images. Choose **Save image** in the top bar for a picture preview: **Conversation only** removes the device, status bar and input field while keeping the contact header and every message. **Save PNG**, **Save JPG** and **Copy image** use that same picture. Right-click or touch and hold the preview for the browser's image actions. Clipboard writing requires a supporting browser and permission; denied access leaves downloads available.

## Privacy and storage

Messages and media stay in the browser: settings use localStorage and media uses IndexedDB. GitHub Pages hosts only the application files. Browser clearing, private browsing and storage limits can remove drafts. Save a JSON project to back up a story or move it to another device. PNG exports use video stills; full chat exports preserve the selected version, theme, bubble color and wallpaper. CSS blur is approximated by static translucent fills during PNG rendering.

## Development and checks

The site runs as plain HTML/CSS/JS. Test tooling is development-only:

```sh
npm ci
npx playwright install chromium
npm test
```

The Messages smoke test checks message creation, dates, groups, photo and video uploads/playback, persistence, all four version/theme combinations, eight legacy PNG downloads, clean PNG/JPG images, real clipboard copying and denied-permission fallback, emoji sequences, stacked contact identity, JSON round trips, and mobile overflow. The Calls test checks navigation, preservation of the Messages draft, all four call screens in both appearances, caller identity/photo, generated numbers, duration, mute/speaker, keypad, answer/end transitions, reload persistence, eight PNG exports, JPG, clipboard copying and mobile layout. Screenshots and exports go to ignored `test-results/`. Use `npm run test:messages` or `npm run test:calls` for an individual studio.

## Third-party license

vendor/html2canvas.min.js is html2canvas 1.4.1, Copyright © 2022 Niklas von Hertzen, distributed under the MIT license; see vendor/LICENSE.html2canvas.

The visual accuracy suite (`npm run test:accuracy`) checks Instagram owner/visitor profile placement, vector controls and chevrons, green Following, Story perspectives and Close Friends placement, exports, and compact attributed Messages Tapbacks with add/change/remove persistence. The Messages Back button has no notification count and returns to the studio dashboard. Instagram loads its own icon set; X retains its existing interface. All review fixtures use neutral names and synthetic media.
