# Notification app artwork

Bundled third-party icons were retrieved from public Apple App Store artwork endpoints on 2026-11-08. Their entry IDs, names, local filenames and original App Store links are in `lock-apps.js`. App names and artwork belong to their respective owners. These icons are not covered by the emoji-data or html2canvas licenses.

The original system-app illustrations in `lockscreen-data.js` are code-drawn UI representations. No app executable or proprietary Apple font is included. The studio does not install apps or connect to notification accounts.

Additional icons can be selected through Apple's public Search API or uploaded by the user. Remote selected icons are converted into browser-local image data when CORS permits; otherwise the studio provides an upload fallback. App Store links are retained on notification editor cards.

Search API documentation: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html

Lock Screen references: https://support.apple.com/en-am/guide/iphone/-iph4d0e6c351/ios and https://support.apple.com/en-ph/guide/iphone/-iphcd5c65ccf/ios
