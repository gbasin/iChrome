/**
 * Fetches storage from Chrome's chrome.storage.local and returns a deferred
 */
define(["core/status", "storage/defaults", "storage/sync", "storage/tojson"], function(Status, defaults, sync, getJSON) {
	var deferred = $.Deferred(),
		storage = {
			Originals: {},
			sync: function() {
				sync(storage);
			}
		};

	chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
		Status.log("Storage fetched, processing.");

		storage.tabs = d.tabs || defaults.tabs;
		storage.themes = d.themes || defaults.themes;
		storage.cached = d.cached || defaults.cached;
		storage.settings = {};

		if (typeof d.tabs == "string") {
			try {
				storage.tabs = JSON.parse(d.tabs);
			}
			catch(e) {
				return deferred.reject();
			}
		}

		$.extend(true, storage.settings, defaults.settings, d.settings || defaults.settings);

		storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

		storage.Originals.tabs = JSON.parse(JSON.stringify(storage.tabs));

		try {
			deferred.resolve(storage);
		}
		catch (e) { // This needs to be here otherwise Chrome will show all errors in all callbacks as happening at line 13 (at the fetch call).
			console.error(e.stack);
		}
	});

	Status.log("Starting storage fetch");

	return deferred.promise();
});