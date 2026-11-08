# Draftroom · iMessage Studio

A private, static conversation studio for writers. A calm black/deep-navy workspace with frosted panels and independent iOS 18 Classic and iOS 27 Liquid Glass-inspired previews.

[Open Draftroom](https://jeilprogress.github.io/draftroom-studio/). GitHub Pages publishes the configured repository source; no application build is required. Keep index.html, styles.css, studio.css, app.js, .nojekyll, and vendor/ together.

## Features

- One-to-one and group conversations, participants and contact photos
- Text, photos, playable videos, timestamps, system events and typing indicators
- Reorder, duplicate and delete messages; delivery/read receipts and Focus status
- Independent day/night previews, blue/green bubbles, wallpapers and glass tint
- Browser draft persistence and portable JSON projects including media
- Phone and full conversation PNG export with a local html2canvas 1.4.1 copy
- Responsive layout, keyboard controls and reduced-motion support

## Design and fonts

Classic uses solid blue/green and neutral bubbles, compact contact navigation and native-style text metrics. Liquid Glass uses floating translucent navigation and composer controls over muted wallpaper, preserving readable bubbles. The iOS 27 option is an original web approximation, not an official Apple implementation or a claim of pixel-perfect fidelity. See [Apple's design overview](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/).

The system font stack uses -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica and Arial. No proprietary font files or Apple emoji artwork are bundled. Text and emoji appearance depends on the operating system.

## Privacy and storage

Messages and media stay in the browser: settings use localStorage and media uses IndexedDB. GitHub Pages hosts only the application files. Browser clearing, private browsing and storage limits can remove drafts. Save a JSON project to back up a story or move it to another device. PNG exports use video stills; full chat exports preserve the selected version, theme, bubble color and wallpaper. CSS blur is approximated by static translucent fills during PNG rendering.

## Development and checks

The site runs as plain HTML/CSS/JS. Test tooling is development-only:

```sh
npm ci
npx playwright install chromium
npm test
```

The smoke test starts a local server and checks message creation, dates, groups, photo and video uploads/playback, persistence, all four version/theme combinations, eight real PNG downloads, JSON round trips, and mobile overflow. Screenshots and exports go to ignored test-results/.

## Third-party license

vendor/html2canvas.min.js is html2canvas 1.4.1, Copyright © 2022 Niklas von Hertzen, distributed under the MIT license; see vendor/LICENSE.html2canvas.
