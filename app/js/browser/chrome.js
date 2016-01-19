/**
 * Implements a browser API for Chrome.  This module largely proxies Chrome's
 * API since that's what iChrome was designed around.
 */
define(function() {
	/* global chrome */
	if (typeof chrome !== "object") {
		return false;
	}

	var API = {
		app: {
			id: chrome.runtime.id,
			version: chrome.runtime.getManifest().version,
			newTab: chrome.runtime.id === "iccjgbbjckehppnpajnmplcccjcgbdep"
		},

		environment: "chrome",

		tabs: chrome.tabs,
		system: chrome.system,
		storage: localStorage,
		runtime: chrome.runtime,
		windows: chrome.windows,
		cookies: chrome.cookies,
		sessions: chrome.sessions,
		topSites: chrome.topSites,
		bookmarks: chrome.bookmarks,
		webRequest: chrome.webRequest,
		management: chrome.management,
		permissions: chrome.permissions,
		syncStorage: chrome.storage.sync,
		chromeLocal: chrome.storage.local,
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

			return "chrome://favicon/size/16@" + devicePixelRatio + "x/" + url;
		}
	};

	return API;
});
