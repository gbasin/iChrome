/**
 * Implements a browser API for Chrome.  This module largely proxies Chrome's
 * API since that's what iChrome was designed around.
 */
define(function() {
	/* global chrome */
	if (typeof chrome !== "object") {
		return false;
	}

	// Many browser properties are getters and cost a few ms each time they're called.
	// If direct calls were used here it would cost about 30ms to run the script on a fast system.

	var dpr = devicePixelRatio;

	var API = {
		app: {
			id: "oghkljobbhapacbahlneolfclkniiami", // chrome.runtime.id
			version: chrome.runtime.getManifest().version,
			newTab: false // chrome.runtime.id === "iccjgbbjckehppnpajnmplcccjcgbdep"
		},

		environment: "chrome",

		storage: localStorage,

		// These calls add up fast, we use getters for basic properties to avoid the cost until necessary
		/* jshint ignore:start */
		get tabs() { return chrome.tabs },
		get system() { return chrome.system },
		get runtime() { return chrome.runtime },
		get windows() { return chrome.windows },
		get cookies() { return chrome.cookies },
		get sessions() { return chrome.sessions },
		get topSites() { return chrome.topSites },
		get bookmarks() { return chrome.bookmarks },
		get webRequest() { return chrome.webRequest },
		get management() { return chrome.management },
		get permissions() { return chrome.permissions },
		get syncStorage() { return chrome.storage.sync },
		get chromeLocal() { return chrome.storage.local },
		/* jshint ignore:end */

		// chrome.i18n costs as well but is always used
		language: localStorage.localeOverride || chrome.i18n.getMessage("lang_code"),


		/**
		 * Returns a favicon for given a URL
		 *
		 * @api     public
		 * @param   {String}  url     The URL to get a favicon for
		 * @return  {String}          The URL of the favicon, or an empty string if no URL was provided
		 */
		getFavicon: function(url) {
			if (!url) {
				return "";
			}

			return "chrome://favicon/size/16@" + dpr + "x/" + url;
		}
	};

	return API;
});
