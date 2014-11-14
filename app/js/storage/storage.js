/**
 * Fetches storage from Chrome's chrome.storage.local and returns a Promise
 */
define(
	["jquery", "lodash", "backbone", "core/status", "core/analytics", "storage/filesystem", "storage/defaults", "storage/sync", "storage/tojson"],
	function($, _, Backbone, Status, Track, FileSystem, defaults, sync, getJSON) {
		var deferred = $.Deferred();

		// These are used to check if anything was changed and to stop a default configuration from being synced
		var lSync = "",
			dString = JSON.stringify(_.pick(defaults, "tabs", "settings", "themes", "cached"));


		var storage = {
				Originals: {},
				sync: function(now, cb, data) {
					if (typeof now == "function") {
						cb = now;
						now = undefined;
					}
					else if (typeof now == "object") {
						data = now;
						cb = undefined;
						now = undefined;
					}
					else if (typeof cb == "object") {
						data = cb;
						cb = undefined;
					}

					data = data || {};
					now = now || false;
					cb = cb || function() {};

					var js = JSON.stringify(_.pick(storage, "tabs", "settings", "themes", "cached"));

					// Don't sync if the settings haven't changed or are the defaults unless this is an onbeforeunload or similar sync
					if (now || (js !== lSync && js !== dString)) {
						lSync = js;

						sync(storage, now, cb);

						syncing = true;

						// If sync was called something was most likely changed, therefore requiring the caller to trigger updated is redundant.
						// Also, UI changes should happen instantly, so this is called synchronously but after the sync synchronous code is run.
						promise.trigger("updated", data);
					}
					else {
						cb();
					}
				}
			};

		var mark = Track.time();

		chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
			mark("Storage", "Loaded");
			
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

		// This lets events get attached and fired on storage itself. It'll primarily be used as storage.on("updated", ...) and storage.trigger("updated")
		var promise = deferred.promise(_.extend({}, Backbone.Events));

		// Alias triggers so all calls have the storage and promise objects added to them
		promise.trigger = function(name, data) {
			if (storage && storage.tabs) { // Don't trigger events if storage isn't loaded
				Backbone.Events.trigger.call(promise, name, storage, promise, data);
			}
		};

		// Trigger the done event on done
		promise.done(function() {
			promise.trigger("done");

			window.onbeforeunload = function() {
				storage.sync(true);
			};
		});

		// If the promise is resolved and a done event is being attached, trigger it
		promise.on = function(events, cb, ctx) {
			if (promise.state() == "resolved" && events.split(" ").indexOf("done") !== -1) {
				if (ctx) {
					cb.call(ctx, storage, promise);
				}
				else {
					cb.call(promise, storage, promise);
				}

				// Remove the event so it doesn't get called from the promise.done() function
				events = events.replace(/(?:^| )done(?:$| )/, "");

				if (!events) return;
			}

			Backbone.Events.on.call(promise, events, cb, ctx);
		};

		var syncing = false;

		// When storage is updated it should automatically be synced
		promise.on("updated", function() {
			if (!syncing) sync(storage);
			else syncing = false;
		});

		// There's no need to put this in the storage object since it doesn't rely on any properties in it
		promise.reset = function(cb) {
			var i = 0,
				done = function() { // Naming this next would be more appropriate but too confusing
					var next = function() {
						var uses = localStorage.uses, // A reset shouldn't affect these
							uid = localStorage.uid;

						localStorage.clear();

						if (uses) localStorage.uses = uses;
						if (uid) localStorage.uid = uid;

						localStorage.installed = true; // Show the installation guide when the page is reloaded

						if (cb) cb();
					};

					// Erase all FileSystem entries
					FileSystem.get(function(fs) {
						var reader = fs.root.createReader(),
							length = 0;

						(function read() { // Recursive and self executing, necessary as per the specs
							reader.readEntries(function(results) {
								if (results.length) {
									results.forEach(function(e, i) {
										length++;

										if (e.isDirectory) {
											e.removeRecursively(function() {
												length--;

												if (!length) {
													next();
												}
											});
										}
										else {
											e.remove(function() {
												length--;

												if (!length) {
													next();
												}
											});
										}
									});

									read();
								}
								else if (!length) {
									next();
								}
							}, next);
						})();
					}, next); // In the event of an error continue anyway
				};

			chrome.storage.local.clear(function() {
				if (i++) done();
			});

			chrome.storage.sync.clear(function() {
				if (i++) done();
			});
		};

		return promise;
	}
);