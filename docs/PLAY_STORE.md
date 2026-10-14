# Putting Pen & Pin on the Google Play Store

Pen & Pin is a web app, so it goes on the Play Store as a **Trusted Web Activity**: a thin Android app that opens
your hosted game in Chrome, full screen, with no address bar. One codebase; a site update reaches players with
no new store release. Google's rules change, so check the current Play Console prompts as you go.

## 0. Do this first
- [ ] Check "Pen & Pin" is free on the Play Store, on social media, and as a web address.
- [ ] Host the game on a permanent HTTPS address (Vercel, GitHub Pages, your own server). The app is tied to it.
- [x] The placeholders in `privacy.html` (name, contact email, host) are filled in. Deploy it. Play needs a public privacy policy link, e.g. `https://YOUR-SITE/privacy.html`.
- [ ] Decide the permanent app id (`com.penandpin.game` is a placeholder). It cannot change after publishing.
- [ ] Create a Google Play developer account (one-time fee, about $25) at https://play.google.com/console.
      New personal accounts must usually run a **closed test with a set number of testers for 14 days** before
      applying for production. Start this early.

## 1. Build the Android app file (.aab)
You need Node.js 18+. Bubblewrap can download the Java and Android tools it needs.

```bash
npm install -g @bubblewrap/cli
cd play
# first time: answer the questions (host, name, package id, key). play/twa-manifest.json lists the answers to use.
bubblewrap init --manifest=https://YOUR-SITE/manifest.webmanifest
bubblewrap build        # makes app-release-bundle.aab (upload this) and app-release-signed.apk (test this)
```
Before running it, replace `YOUR-SITE.example.com` everywhere in `play/twa-manifest.json` with your real host.
If you keep that file as it is, `bubblewrap update` rebuilds the Android project from it.

Easier alternative: https://www.pwabuilder.com, paste your game's address, choose Android, and download the package.

Back up the signing key file (`android.keystore`) and its passwords somewhere safe. They are git-ignored on purpose.
If you lose the key you may not be able to update the app.

## 2. Connect the app to your site (Digital Asset Links)
This is what removes the browser bar. Get the SHA-256 fingerprint of your signing key:
```bash
keytool -list -v -keystore play/android.keystore -alias penandpin
```
Put it in `.well-known/assetlinks.json` (replace the placeholder), deploy, and check that
`https://YOUR-SITE/.well-known/assetlinks.json` opens in a browser. If you use **Play App Signing** (the default),
Google re-signs your app, so also add the SHA-256 shown in Play Console under *Setup > App signing*. Both
fingerprints can sit in the same list.

## 3. Test it
Install `app-release-signed.apk` on a real Android phone. It should open the game full screen, sideways, with no
address bar. If a bar shows, the asset links file is missing or has the wrong fingerprint or package id.
Check that online play connects (see `net-config.js`) and that the game starts with no connection.

## 4. Fill in the Play Console
- **Store listing:** copy from `docs/play-store-listing.md`. Needs a 512x512 icon, a 1024x500 feature graphic and
  at least two phone screenshots (landscape works).
- **Privacy policy:** `https://YOUR-SITE/privacy.html`.
- **Content rating:** answer the IARC questionnaire honestly. It has cartoon-style violence (shooting drawn
  stick figures), no gore, no gambling, no purchases, online play with other players but no chat.
- **Target audience:** not designed for children; choose 13+ (or older).
- **Data safety form:** answer for what the game does. As written in `privacy.html`: the game collects nothing
  itself, has no ads or analytics, and stores settings on the device. Online play shares the player's display name
  with other players in the match, and a matchmaking and relay service sees a connection id and network address.
  Declare those accurately; Google can reject an app whose form does not match what it does.
- **Ads:** none. **In-app purchases:** none.
- **App access:** no login needed.

## 5. Release
1. Upload the `.aab` to a **closed testing** track, add your testers, and wait out the testing period.
2. Fix anything testers find, then apply for production access and submit. Review takes from hours to several days.
3. Later updates: the site updates on its own. Only build a new `.aab` (raise `appVersionCode`) when you change
   the app's name, icon or settings.

## Files in this repo for this
- `privacy.html`: the privacy policy page (fill in the placeholders).
- `play/twa-manifest.json`: the settings Bubblewrap uses for the Android app.
- `.well-known/assetlinks.json`: the site-to-app link (fill in the fingerprint).
- `docs/play-store-listing.md`: the store text.
