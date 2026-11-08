# Draftroom · iMessage Studio

A private, static creative workspace for writers. A calm black/deep-navy home screen opens independent Messages, Calls and Lock Screen studios, each with iOS 18 Classic and iOS 27 Liquid Glass-inspired previews.

## Lock Screen studio

[Open Lock Screen](https://jeilprogress.github.io/draftroom-studio/lockscreen.html), the third studio on the home screen. Messages and Calls code and drafts are kept separate.

- Classic and Liquid Glass-inspired notification cards, wallpaper controls and clock materials
- Independent Light/Dark notification appearance, including grouped cards, stack layers, Focus summaries, music cards and exported images
- Liquid Display vector numerals with layered translucency and clipped surface highlights; Classic retains its rounded numeric outlines
- Ten clock interpretations, with rounded SVG numerals for the standard/rounded/thin/bold/condensed/outline styles and local fonts for the remaining styles, three numeral sets, font weight/color/size controls, glass opacity and vertical stretching with a draggable or keyboard-adjustable resize handle
- Editable date/inline widget line and 12 widget types: weather, temperature, battery, activity rings, calendar, alarm, world clock, reminders, stocks, sunrise, moon and custom; a four-space row that can sit below the clock or near the bottom
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

Clock styles and glass are web approximations using licensed rounded numeral outlines and local fonts; they do not bundle Apple's fonts, reproduce native optical refraction or automatically segment a wallpaper subject. The transparent foreground upload provides the depth layer. The phone picture captures the visible part of the notification list; scroll the preview to choose which cards are visible. Widgets and notifications are fictional editable values, not live account data or installed apps. App Store search sends only the typed app query to Apple; selected remote icons are embedded locally when available. See `vendor/lock-apps/NOTICE.md` for artwork provenance.

Design references: [Apple Lock Screen customization](https://support.apple.com/en-am/guide/iphone/-iph4d0e6c351/ios), [Apple Lock Screen features and notification views](https://support.apple.com/en-ph/guide/iphone/-iphcd5c65ccf/ios), and [Apple Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html).

Run `npm run test:lockscreen` for its browser checks. Set `LOCKSCREEN_LIVE_SEARCH=1` to additionally verify Apple's live JSONP search and icon embedding; the normal test deterministically checks that integration at its network boundary. The test covers clocks, notification templates/grouping/privacy, all widget types and capacity, Focus, music/shortcuts, uploads/depth, persistence/project round trips, real image downloads and clipboard copying, mobile layout and preservation of the other drafts. It also checks visible clock pixels in the Liquid Glass PNG.

[Open Draftroom](https://jeilprogress.github.io/draftroom-studio/). GitHub Pages publishes the configured repository source; no application build is required. The home page is `index.html`, Messages is `messages.html`, and Calls is `calls.html`. Keep these pages with their adjacent CSS/JS files, `.nojekyll`, and `vendor/`.

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
