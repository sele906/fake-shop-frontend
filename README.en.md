# NOBUY (안삼)

**[한국어](./README.md) | [English](./README.en.md)**

> Spend the urge, not the money.

**NOBUY** is a fake shopping mall where you browse products, fill a cart, collect
coupons, check out, and wait for a delivery — **the whole shopping experience,
without ever buying anything.**

No real products, no real payments, no real deliveries. What is real is the part
of shopping that is actually fun — looking around and choosing — built as
interaction.

### 🔗 Live

[Open NOBUY on the web](https://fake-shop-frontend-ivory.vercel.app)

---

## 📷 Preview

![NOBUY main screen](docs/main_screenShot_en.png)

---

## ✨ What's inside

|                 |                    |
| --------------- | ------------------ |
| **1,446**       | fake products      |
| **18,872**      | product reviews    |
| **95**          | categories         |
| **58**          | coupon types       |
| **6**           | hidden missions    |
| **2 languages** | Korean · English   |
| **2 platforms** | Web · Android app  |

### Shopping

* Browsing across 12 top-level and 83 sub-level categories
* Product options and cart management
* Rating distribution, load-more reviews, related products
* Coupon issuing and stacked discounts
* Fake checkout and delivery tracking
* Restraint and dopamine gauges
* Hidden missions and achievement coupons scattered across the site
* Receipts you can share with a link

### Experience

* Korean · English switching
* Dark and light mode, following the system setting
* State kept in LocalStorage
* Responsive web UI
* Android app (in review on Google Play)

---

## 🛠 Tech Stack

### Frontend

`React` `JavaScript` `React Router` `i18next` `CSS Modules`

### App

`Capacitor` `Android`

### Deployment

`Vercel` `Google Play (in review)`

### Data

Products, reviews, brands, categories, and coupons are all kept as JSON so that
the site runs without a server.

---

# 🔍 Implementation

## 1. A shopping mall with no server

NOBUY is built so that the main flows of an online store work without a login or
a backend server.

Anything that has to survive per visitor — the cart, coupons, hidden-mission
progress — is written to `localStorage` and restored on launch.

When nothing is stored, or the stored value is not in the expected shape, the app
falls back to its default state.

---

## 2. Building data for more than 1,400 products

To make the catalog browsable the way a real store is, the following data was
authored for the project.

* 1,446 products
* 18,872 reviews
* 10,727 spec rows
* 384 brands
* 95 categories
* 58 coupon types

Writing that many reviews by hand was not an option, so generation was automated
with spreadsheets and JSON dictionaries.

Every review carries its own author, date, body, and rating, and each product's
average rating is computed from the ratings of its own reviews.

---

## 3. Hidden missions that never pay out twice

Certain actions around the site complete a hidden mission and issue a coupon.

So that repeating the same action never issues the coupon again, the **record of
completed missions** is stored separately from the coupon wallet.

```text
User action
   ↓
Check mission condition
   ↓
Check whether it is already completed
   ↓
Save the completion record
   ↓
Issue the coupon
   ↓
Show the shared notification
```

Completion and coupon issuing live in one place, so a mission behaves the same no
matter which page triggers it.

---

## 4. Receipts that fit in a link

Sharing a receipt uses no server and no database.

The receipt is turned into JSON, converted to UTF-8 bytes, encoded as Base64URL,
and carried in a URL parameter.

```text
Receipt data
→ JSON
→ UTF-8
→ Base64URL
→ /receipt?d=...
```

So that a shared receipt does not change when the product data is regenerated,
the link stores **a snapshot** — product names and quantities — instead of
product IDs.

If the URL arrives truncated or damaged, the decode failure is detected and an
error screen is shown in place of the receipt.

---

## 🌏 Internationalization

Korean and English are supported through per-language JSON files in
`src/locales`.

```text
src/locales
├─ ko
└─ en
```

On a first visit the browser language decides which one loads, and a language
picked by hand is saved to `localStorage` so it survives to the next visit.

---

## 🚚 Fake checkout and delivery

Since no payment ever happens, the checkout and delivery flows were free to
become an interaction of their own.

Delivery tracking is a six-stage animation that travels along an SVG path, with
each stage timed to match the movement so the package appears to be on its way.

---

## 📱 A website that is also an app

The same code runs in a browser and, wrapped with Capacitor, as an Android app.

```bash
npm run build:app   # builds the web app and copies the output into the app
```

What changes inside the app:

* The device back button — it closes an open drawer or modal first, then goes to
  the previous screen, and on the first screen it takes two presses to exit.
* Browser defaults such as the long-press menu and drag selection are turned off.
* Fonts ship inside the app, so text is drawn from the moment it launches.
* Switching between dark and light mode switches the status bar along with it.

Shared links open straight in the app through App Links. Only two paths are
claimed — receipts (`/receipt`) and product details (`/product/`) — so every
other link on the site still opens on the web.

For anyone without the app installed, the same address is simply a web page.

---

## 🌗 Dark and light mode

Colors live in CSS variables, and a single `data-theme` attribute on `<html>`
swaps the whole palette.

Light, dark, and system are the three choices, and the selected one is saved to
`localStorage` so it persists across visits.

In the app the choice is passed to the native side as well, so the status bar
follows the theme.

---

# 🧩 Troubleshooting

<details>
<summary><strong>Korean product names breaking in receipt links</strong></summary>

### Problem

The browser's `btoa()` only accepts Latin-1 strings, so encoding a receipt that
contained Korean product names threw an error.

### Solution

`TextEncoder` converts the string to UTF-8 bytes first, and the bytes are then
Base64-encoded.

To make the result safe inside a URL,

* `+` → `-`
* `/` → `_`
* `=` stripped

which turns it into Base64URL.

</details>

<details>
<summary><strong>Repeating a hidden mission issued the coupon twice</strong></summary>

### Problem

Checking only whether the coupon was held meant that once it had been spent, the
same mission could issue it all over again.

### Solution

The record of completed missions is stored separately from the coupon wallet, and
that record is checked first.

</details>

<details>
<summary><strong>Android App Links opened the app in debug but fell back to the web once released</strong></summary>

### Problem

App Links were configured so that certain web URLs would open in the Android app.

In local debug builds the links opened the app as expected, but in the release
version installed from Google Play the same links opened in a browser.

Even with the certificate fingerprint verified locally and registered in
`assetlinks.json`, domain verification did not happen for the released app.

### Cause

An app distributed through Google Play is re-signed with the **Google Play App
Signing certificate**, not with the key used to build it locally.

Registering only the SHA-256 fingerprint of the debug or upload key therefore
never matches the signature of the app people install from the Play Store.

### Solution

The SHA-256 fingerprint of the **App Signing certificate** that Google Play
actually uses was taken from the Play Console and added to `assetlinks.json`.

Both the release and debug certificates are registered, so domain verification
also works while developing.

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ansam.app",
      "sha256_cert_fingerprints": [
        "PLAY_APP_SIGNING_SHA256_FINGERPRINT",
        "DEBUG_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

After the fix, shared links opened in the app installed from the Play Store as
well.

</details>

---

## 📁 Project Structure

```text
.
├─ android
├─ public
│  ├─ .well-known
│  ├─ fonts
│  └─ index.html
└─ src
   ├─ assets
   ├─ cart
   ├─ components
   ├─ coupon
   ├─ data
   │  ├─ ko
   │  └─ en
   ├─ hooks
   ├─ lib
   ├─ locales
   │  ├─ ko
   │  └─ en
   ├─ order
   ├─ pages
   ├─ receipt
   ├─ router
   ├─ App.js
   └─ i18n.js
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/sele906/fake-shop-frontend.git
cd fake-shop-frontend

npm install
npm start
```

The dev server runs at `http://localhost:3000` by default.

---

## 📌 Data and Images

* Product images come from **Pexels**.
* Product names, brands, descriptions, and reviews are fictional data written for
  this project.
* Nothing is really sold, paid for, or delivered on NOBUY.

---

## 🗺️ Roadmap

* Search by product name and brand
* Migrate to TypeScript
* Accessibility improvements
* Write tests
