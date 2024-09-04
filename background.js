// Use chrome.identity.getAuthToken() in a background script, not a content script:
// The chrome.identity API, including getAuthToken(), cannot be accessed directly from a content script. You need to call it from a background script or event page instead. Move your code that uses getAuthToken() to a background script file (e.g., background.js) and register it in manifest.json:

chrome.action.onClicked.addListener(function(){
    chrome.tabs.create({url: 'index.html'});
});

1. popup.html
    AuthButton.

2. background.js

3. content.js