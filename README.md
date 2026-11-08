# Draftroom · iMessage Studio

A fictional Messages conversation builder for writers, featuring an iOS 18 Classic view and an iOS 27 Liquid Glass-inspired view. The entire app is static HTML/CSS/JavaScript, so you **do not need VS Code, npm, Railway, or a local server** to publish it.

## Publish on GitHub Pages using only your browser

1. Log in to GitHub on the account where you want this project. Create a **new public repository** named `draftroom-studio` (separate from existing projects), and tick **Add a README file** when creating it.
2. Open the new repository and select **Add file → Upload files**. Drag **`index.html`, `styles.css`, `app.js`, and `.nojekyll`** from this ZIP into the upload area. Choose **Commit changes**. (You can include this README too.)
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, set **main** and **/(root)**, and click **Save**.
4. Your website will be at `https://YOUR-GITHUB-USERNAME.github.io/draftroom-studio/` when GitHub finishes deployment. GitHub's Pages panel displays the actual URL.

If you have the GitHub connector active in ChatGPT, subsequent changes can be committed directly to the repository after creation.

## Features

- iOS 18 Classic and **iOS 27 Liquid Glass** (an iOS 27-inspired Liquid Glass recreation)
- Day/night modes; blue/green message bubbles; modern chat wallpapers, adjustable glass tint, or custom photo wallpaper
- One-to-one and group messages with custom group names, participants, nicknames, and contact photos
- Freeform text messages, attached photos and videos, typing bubble animation
- Editable timestamp separators, custom system events (joining, leaving, removing members, Focus, unsent messages, blocked chat)
- Message receipts, reorder, duplicate and delete messages
- Full conversation PNG and phone-sized PNG export (requires internet to load the pinned html2canvas library)
- Browser auto-save and portable JSON project export/import with attachments included
- Designed for future addition of other fictional app generators via the right-hand dock

## Privacy and limitations

This is a front-end-only writing tool. **No messages or media are uploaded to GitHub or any private server.** Draft settings are saved in your browser's local storage. Photo/video attachments are stored in IndexedDB in the same browser, unless storage is unavailable. To work on a different device, choose **Save project** then **Import project** there. Videos may not persist when browser storage is exhausted. Public GitHub Pages hosts only the app code, not users' individual stories.

Apple's emoji artwork and San Francisco fonts are proprietary; the app uses the device's native system fonts and Unicode emoji. Apple devices will render native Apple emoji. On Windows/Android, emoji may look different. It is an original web recreation, not a pixel-perfect native implementation or an official Apple product.

For PNG export, the HTML2Canvas library is loaded from jsDelivr and requires an internet connection; video thumbnails are rendered as still frames in PNGs. Media playback is available by tapping a video's preview.

Avoid using genuine private conversations without consent. This tool is for fiction and mockups.
