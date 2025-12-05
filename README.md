An example of using [Appium](https://appium.io) as test automation for an e2e test for applications developed with [Wails](https://wails.io).

This example uses Javascript (a node.js based test driver via [mocha](https://mochajs.org/)), but Appium supports a variety of client languages, including Python, Java, Ruby and .NET (apparently no official golang client yet though...)

NOTE: this example has been tested on macOS.  It should also work on Windows or Linux by substituting different backend Appium drivers.

This example assumes some familiarity with both Wails and Appium, but hopes to ease the creation of your first Wails end-to-end test automation.

# Create a Wails application

For this example, we use the basic app created by `wails3 init`:

```
wails3 init -n exampleapp
```

Edit the HTML to add `aria-label` labels to the elements needed for the test.  Appium cannot use normal css / DOM selectors as you would when testing a normal web application.  While you _can_ use raw XPath expressions for the XCUIElement searches, The aria-label is the easiest way to test with Appium.

```diff
# git diff .
diff --git a/exampleapp/frontend/index.html b/exampleapp/frontend/index.html
index f80af77..05f20d5 100644
--- a/exampleapp/frontend/index.html
+++ b/exampleapp/frontend/index.html
@@ -19,10 +19,10 @@
     </div>
     <h1>Wails + Javascript</h1>
     <div class="card">
-        <div class="result" id="result">Please enter your name below 👇</div>
+        <div aria-label="result" class="result" id="result">Please enter your name below 👇</div>
         <div class="input-box" id="input">
-            <input class="input" id="name" type="text" autocomplete="off"/>
-            <button class="btn" onclick="doGreet()">Greet</button>
+            <input aria-label="name" class="input" id="name" type="text" autocomplete="off"/>
+            <button aria-label="greet-button" class="btn" onclick="doGreet()">Greet</button>
         </div>
     </div>
     <div class="footer">
```

Build it (note: you need the full packaged app, not just the executable created by `wails3 build`:

```
cd exampleapp
wails3 package
```

# Install Appium

Install the main server:

```
npm install --location=global appium
```

Install a driver.  For macOS, we use the `mac2` driver; choose the one that matches your platform.  Use `appium driver list` to see a list of available drivers.

```
appium driver install mac2
```

Install the Inspector plugin.  It's not strictly necessary for running an automated test, but it can be useful for finding selector expressions for specific elements of your UI (you can think of it as the Appium specific version of the "Inspect Element" Developer Tools in Chrome or Firefox).

```
appium plugin install inspector
```

# Create your test driver

The e2e-test directory has a working test driver for the Wails app.   To use it directly, run the following commands:

```
cd e2e-test
npm install
```

## How the e2e-test directory was created

In this example, I'm using a Javascript based mocha test client.  It was created using the webdriverio's [Getting Started](https://webdriver.io/docs/gettingstarted/) guidelines with these steps:

```
mkdir e2e-test
cd e2e-test
npm install --save-dev webdriverio
npm init wdio@latest
```

`npm init wdio@latest` will prompt for various settings.  Accept the defaults except for the "What type of testing" - for that, select "Desktop Testing - of MacOS Applications".

The example test driver tests the Apple Calculator app.  Edit `wdio.conf.js` to instead test our Wails application instead.

```diff
# git diff wdio.conf.js 
diff --git a/e2e-test/wdio.conf.js b/e2e-test/wdio.conf.js
index 765be7b..25fba8d 100644
--- a/e2e-test/wdio.conf.js
+++ b/e2e-test/wdio.conf.js
@@ -1,3 +1,5 @@
+resolve = require('path').resolve
+
 exports.config = {
     //
     // ====================
@@ -53,7 +55,9 @@ exports.config = {
     capabilities: [{
         platformName: 'Mac',
         'appium:automationName': 'Mac2',
-        'appium:bundleId': 'com.apple.calculator'
+        //'appium:bundleId': 'com.apple.calculator'
+        'appium:bundleId': 'com.wails.exampleapp',
+        'appium:appPath': resolve('../exampleapp/bin/exampleapp.app')
     }],
```

Note that Appium does not support relative paths for the appPath value. It must be an absolute path.

I then edited the example test driver to test the Wails Greeting service instead of the Apple calculator:

```javascript
import { expect, $ } from '@wdio/globals'

describe('Wails Testing', () => {
    it('should say hello', async function () {
        await $('~name').setValue('My Name')
        await $('~greet-button').click()
        await expect($('~result').toHaveText('Hello My Name'))
    })
})

```

# Finding element selectors

## Use aria-label

The easiest way to test a Wails webview application is to annotate your HTML elements with `aria-label` attributes.  Appium can then find them up directly with selectors like this:

```
 await $('~mybutton').click()
```

## Use the Appium Inspector

If you don't have the ability to add aria-labels to your sources, then you can use the Appium Inspector to find more complicated XPath selectors.   This is discouraged in the Appium docs since XPath expressions are very sensitive to layout changes in the app.

Run the inspector via:

```
appium server --use-plugins inspector
```

Then open a browser at (http://127.0.0.1:4723/inspector).  Create a capability set matching the one in wdio.conf.js (Remember, that the app path must be an absolute path), start a session and the Inspector will display the element tree, which you can navigate to find the elements of interest and their various properties - including XPath expressions you can use in your tests.




