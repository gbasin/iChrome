/*global chrome: true */
var parentOrigin = location.ancestorOrigins[location.ancestorOrigins.length - 1];
if (parentOrigin === location.origin) {
    // Only send a message if the frame was opened by ourselves.
    chrome.runtime.sendMessage(location.hash.slice(1));
}