/**
 * Chrome's "core information" APIs are slow, this module caches their outputs so multiple calls can be avoided
 */
define(function() {
	return {
		id: chrome.runtime.id,
		version: chrome.runtime.getManifest().version,
		language: localStorage.localeOverride || chrome.i18n.getMessage("lang_code")
	};
});