/**
 * Saves storage to Chrome's chrome.storage.sync
 */
define(["jquery", "core/status", "storage/defaults", "core/analytics", "storage/tojson", "core/uid"], function($, Status, Defaults, Track, getJSON, uid) {
	var timeout = null;

	// Splits a string into the specified chunk size
	var chunk = function(str, size) {
		str = str || "";
		size = size || 4;

		var slength = str.length,
			chunks = [];

		if (slength <= size) {
			return [str];
		}

		for (var i = size; i < slength; i += size) {
			chunks.push(str.slice(i - size, i));
		}

		chunks.push(str.slice(slength - (size - slength % size)));

		return chunks;
	};

	var save = function(storage, ocb) {
		Status.log("Starting sync save");

		var cb = function() {
			ocb();
		};

		timeout = null;

		var sync = {},
			local = {};

		sync.themes = local.themes = storage.themes;
		sync.settings = local.settings = storage.settings;

		local.cached = storage.cached;

		local.tabs = [];

		storage.tabs.forEach(function(tab, i) {
			local.tabs.push($.unextend({
				alignment: storage.settings.alignment,
				theme: storage.settings.theme,
				fixed: storage.settings.columns.split("-")[1] == "fixed"
			}, $.unextend(Defaults.tab, tab)));
		});

		sync.tabs = storage.tabsSync;
		sync.lastChanged = new Date().getTime() + "-" + uid;

		var sTabs = JSON.stringify(sync.tabs),
			syncTabs = false;

		if (sTabs !== JSON.stringify(Defaults.tabs)) { // Don't sync _tabs_ if this is the default installation, only accept incoming syncs
			syncTabs = true;

			var arr = chunk(sTabs, 2000); // Less than half the max item size since it has to re-escape quotes, etc.

			arr.forEach(function(e, i) {
				sync["tabs" + (i ? i : "")] = e;
			});
		}

		// Compare and remove extra tab chunks that won't be overwritten.  This may or may not run after the two saves are called.
		chrome.storage.sync.get(function(d) {
			if (syncTabs) {
				var max = 0,
					key;

				for (key in d) {
					if (key.indexOf("tabs") == 0 && max < key.substr(4) || 0) {
						max = (key.substr(4) || 0);
					}
				}

				if (max >= arr.length) {
					var keys = [];

					for (var i = arr.length; i <= max; i++) {
						keys.push("tabs" + i);
					}

					chrome.storage.sync.remove(keys);
				}
			}
		});

		// Sync
		var i = 0,
			mark = Track.time();

		chrome.storage.sync.set(sync, function() {
			mark("Storage", "Sync", "Sync");

			if (i++) cb(); // i++ returns 0 the first time => false and 1 the second time => true
		});

		chrome.storage.local.set(local, function() {
			mark("Storage", "Sync", "Local");

			if (i++) cb();
		});

		// Get current usage percentage, if it's over 90% alert the user.
		chrome.storage.sync.getBytesInUse(function(bytes) {
			if ((bytes / chrome.storage.sync.QUOTA_BYTES) > 0.90) {
				Track.event("Storage", "Quota", (bytes / chrome.storage.sync.QUOTA_BYTES) + "%"); // If these are happening a lot something isn't built right...

				alert(
					"You have used more than 90% of the total synchronized storage space available.\r\nIf" + 
					" you reach the limit, iChrome will stop syncing your data and may stop working.\r\n" + 
					"You can shrink the amount of space you use by deleting custom themes, notes and to-" + 
					"do lists you don't use."
				);
			}
		});
	};

	// This can't require storage since that would be a circular dependency
	var sync = function(storage, now, cb) {
		Status.log("Sync called");

		clearTimeout(timeout);

		if (!now) {
			timeout = setTimeout(function() {
				save(storage, cb);
			}, 2000);
		}
		else {
			save(storage, cb);
		}

		// tabsSync is used by the sync function and modules, therefore it needs to be kept up to date
		storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));
	};

	return sync;
});