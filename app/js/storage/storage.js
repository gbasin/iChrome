/**
 * Loads storage and returns a Promise that can be used to listen for updates
 */
define([
	"jquery", "lodash", "backbone", "browser/api", "core/status", "core/analytics", "storage/filesystem",
	"core/auth", "storage/syncapi", "storage/deprecate", "storage/defaults", "storage/updatethemes", "storage/tojson", "lib/unextend"
], function($, _, Backbone, Browser, Status, Track, FileSystem, Auth, API, Deprecate, defaults, updateThemes, getJSON, unextend) {
		var deferred = $.Deferred();

		// This lets events get attached and fired on storage itself. It'll primarily be used as storage.on("updated", ...) and storage.trigger("updated")
		var promise = deferred.promise(_.extend({}, Backbone.Events));

		/**
		 * Wraps Backbone's Events.trigger method so every event handler is passed
		 * the storage and promise objects along with any extra data.
		 *
		 * @api     public
		 * @param   {String}    name  The name of the event to trigger
		 * @param   {Anything}  data  Any data to pass to the handlers
		 */
		promise.trigger = function(name, data) {
			if (storage && storage.tabs) { // Don't trigger events if storage isn't loaded
				Backbone.Events.trigger.call(promise, name, storage, promise, data);
			}
		};

		// Trigger the done event on done
		promise.done(function() {
			promise.trigger("done");

			window.onbeforeunload = function() {
				if (timeout) {
					save(true, _.noop, true);
				}
			};
		});


		/**
		 * Wraps Backbone's Events.on method, triggering the `done` event if storage is
		 * already available.
		 *
		 * @api     public
		 * @param   {String}    events  A space separated list of events to bind this handler to
		 * @param   {Function}  cb      The handler to bind to the events
		 * @param   {Anything}  ctx     The context the handler should be bound to
		 */
		promise.on = function(events, cb, ctx) {
			// If the promise is resolved and a done event is being attached, trigger it
			if (promise.state() === "resolved" && events.split(" ").indexOf("done") !== -1) {
				if (ctx) {
					cb.call(ctx, storage, promise);
				}
				else {
					cb.call(promise, storage, promise);
				}

				// Remove the event so it doesn't get called from the promise.done() function
				events = events.replace(/(?:^| )done(?:$| )/, "");

				if (!events) {
					return;
				}
			}

			Backbone.Events.on.call(promise, events, cb, ctx);
		};

		var saving = false;

		// When storage is updated it should be synced
		promise.on("updated", function() {
			if (!saving) {
				storage.sync();
			}
			else {
				saving = false;
			}
		});


		/**
		 * Resets Browser.storage and FileSystem, but not the sync token and user data,
		 * to their original states.
		 *
		 * @api     public
		 * @param   {Function}  cb
		 */
		promise.reset = function(cb) {
			FileSystem.clear(function() {
				// A reset shouldn't affect these since we'll still want to sync when this is over
				var uses = Browser.storage.uses,
					version = Browser.storage.version,
					authData = Browser.storage.authData;

				Browser.storage.clear();

				if (uses) {
					Browser.storage.uses = uses;
				}

				if (version) {
					Browser.storage.version = version;
				}

				if (authData) {
					Browser.storage.authData = authData;
				}

				Browser.storage.firstRun = true; // Show the installation guide when the page is reloaded

				// Overwrite with the default configuration
				_.assign(storage, _.pick(defaults, "tabs", "settings", "themes", "cached"));

				storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

				// Force a save and sync
				save(true, function() {
					if (cb) {
						cb();
					}
				});
			});
		};


		/**
		 * Checks for and loads any changes from the sync server
		 *
		 * @api     private
		 * @param   {Boolean}  fromInterval  Whether or not this call is from an interval, used for tracking.
		 */
		var loadSync = function(fromInterval) {
			if (!Auth.isSignedIn) {
				return;
			}

			var mark = Track.time();

			API.get({
				modifiedSince: storage.modified,
				fromInterval: fromInterval ? 1 : undefined
			}, function(err, data) {
				mark("Sync", "Load");

				if (!err && data) {
					if (data.modified === false) {
						return;
					}

					updateThemes(storage, data, function(processed) {
						storage.modified = new Date(data.modified).getTime();

						_.assign(storage, processed);

						storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

						lastSynced = JSON.stringify(_.pick(storage, "user", "tabsSync", "settings", "themes"));

						lastSaved = JSON.stringify(_.pick(storage, "user", "tabs", "settings", "themes", "cached"));

						save(false, _.noop);

						// Temporary flag to prevent a recursive loop from the updated call
						saving = true;

						promise.trigger("updated");
					});
				}
				else if (err && err === "No token") {
					save(true, _.noop);
				}
				else {
					Status.log("Error in storage fetch: " + err);
				}
			});
		};

		// Refresh every 15 minutes
		setInterval(function() {
			loadSync(true);
		}, 9E5);


		// These are used to check if anything was changed and to stop a default configuration from being synced
		var timeout = null,
			lastSaved = "",
			lastSynced = "",
			dString = JSON.stringify(_.pick(defaults, "user", "tabs", "settings", "themes", "cached"));

		var cacheTheme = function() {
			// We can't use the theme utils here since they require storage
			var image;

			if (storage.settings.theme === "custom") {
				image = storage.settings.backgroundImage;
			}
			else {
				image = (storage.cached[storage.settings.theme] || storage.themes[(storage.settings.theme + "").replace("custom", "")] || storage.cached[0]).image;
			}

			if (!image || image.slice(-4) === ".mp4") {
				delete Browser.storage.themeImg;

				return;
			}

			Browser.storage.themeImg = image;
		};


		/**
		 * Saves and optionally syncs storage
		 *
		 * @api     private
		 * @param   {Boolean}      sync       Whether or not to sync storage
		 * @param   {Function}     cb
		 * @param   {Boolean}      useBeacon  If a beacon should be used for this sync
		 * @return  {null|Beacon}             If useBeacon was specified, the beacon is returned
		 */
		var save = function(sync, cb, useBeacon) {
			Status.log("Starting storage save");

			timeout = null;

			// Local save
			var local = _.pick(storage, "user", "cached", "themes", "settings", "modified");

			local.tabs = _.map(storage.tabs, function(tab) {
				return unextend({
					isGrid: storage.settings.layout === "grid",
					fixed: storage.settings.columnWidth === "fixed"
				}, unextend(defaults.tab, tab));
			});

			Browser.storage.config = JSON.stringify(local);

			// Cache the default theme image
			cacheTheme(storage);


			// Sync save
			if (Auth.isSignedIn && sync) {
				if (useBeacon) {
					Status.log("Sending sync beacon");

					return cb(API.sync({
						tabs: storage.tabsSync,
						themes: storage.themes,
						settings: storage.settings
					}, true));
				}

				Status.log("Starting sync save");

				var mark = Track.time();

				API.sync({
					tabs: storage.tabsSync,
					themes: storage.themes,
					settings: storage.settings
				}, function(err, d) {
					if (!err && d) {
						var modified = new Date(d.modified).getTime();

						storage.modified = local.modified = modified;

						if (d.user) {
							storage.user = local.user = d.user;
						}

						Browser.storage.config = JSON.stringify(local);
					}

					mark("Sync", "Save");

					cb();
				});
			}
			else {
				cb();
			}
		};

		var storage = {
			/**
			 * Schedules a storage save
			 *
			 * @api     public
			 * @param   {Boolean}   [now]        If the save should be triggered immediately
			 * @param   {Function}  [cb]         A function to be called when the save is actually triggered.
			 *
			 * @param   {Anything}  [data]       Any data that should be passed to the update event that
			 *                                   will be triggered.  Useful to avoid double-renders.
			 *
			 * @param   {Boolean}   [forceSync]  Whether or not a sync save, instead of just a local one,
			 *                                   should be forced, regardless of changes since the last sync.
			 */
			sync: function(now, cb, data, forceSync) {
				if (typeof now === "function") {
					cb = now;
					now = undefined;
				}
				else if (typeof now === "object") {
					data = now;
					cb = undefined;
					now = undefined;
				}
				else if (typeof cb === "object") {
					data = cb;
					cb = undefined;
				}

				data = data || {};
				now = now || false;
				cb = cb || function() {};
				forceSync = forceSync || false;

				var stringified = JSON.stringify(_.pick(storage, "user", "tabs", "settings", "themes", "cached"));

				// Don't sync if the settings haven't changed or are the defaults unless this is a onbeforeunload or similar sync
				if (now || (stringified !== lastSaved && stringified !== dString)) {
					lastSaved = stringified;

					Status.log("Sync called");

					clearTimeout(timeout);

					timeout = null;

					storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

					var syncString = JSON.stringify(_.pick(storage, "user", "tabsSync", "settings", "themes"));

					var sync = forceSync || (syncString !== lastSynced);
					if (!storage.isSync) {
						storage.isSync = sync;
					}

					if (sync) {
						lastSynced = syncString;

						// Until we have a timestamp from the server
						storage.modified = new Date().getTime();
					}

					if (!now) {
						timeout = setTimeout(function() {
							save(storage.isSync, cb);
							storage.isSync = false;
						}, 2000);
					}
					else {
						save(storage.isSync, cb);
						storage.isSync = false;
					}


					// Temporary flag to prevent a recursive loop from the updated call
					saving = true;

					// If sync was called something was most likely changed, therefore requiring the caller to trigger updated is redundant.
					// Also, UI changes should happen instantly, so this is called synchronously but after the sync synchronous code is run.
					if (now !== "final") {
						promise.trigger("updated", data);
					}
				}
				else {
					cb();
				}
			},
			isSync : false
		};

		var parseData = function(data) {
			var d;

			if (typeof data === "string") {
				d = JSON.parse(data || Browser.storage.config || "{}");
			}
			else {
				d = data || {};
			}

			storage.user = d.user || defaults.user;
			storage.themes = d.themes || defaults.themes;
			storage.cached = d.cached || defaults.cached;
			storage.tabs = Deprecate.tabs(d.tabs || defaults.tabs);

			if (!storage.cached[0]) {
				storage.cached[0] = defaults.cached[0];
			}

			storage.modified = d.modified || 0;

			if (d.settings) {
				storage.settings = _.defaultsDeep(Deprecate.settings(d.settings), defaults.settings);
			}
			else {
				storage.settings = _.cloneDeep(defaults.settings);
			}

			storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

			// Set the last saved and synced values to the just loaded data
			lastSaved = JSON.stringify(_.pick(storage, "user", "tabs", "settings", "themes", "cached"));
			lastSynced = JSON.stringify(_.pick(storage, "user", "tabsSync", "settings", "themes"));

			// Backup once a day, before any changes are made
			if (new Date().getTime() - (Browser.storage.lastBackup || "0") > 864E5) {
				var backups = JSON.parse(Browser.storage.backups || "[]");

				backups.unshift({
					date: new Date().getTime(),
					data: {
						tabs: storage.tabsSync,
						themes: storage.themes,
						settings: storage.settings
					}
				});

				Browser.storage.backups = JSON.stringify(backups.slice(0, 4));
				Browser.storage.lastBackup = new Date().getTime();

				backups = null;
			}


			// Load any updates from the sync server, sending the request before the page is rendered
			loadSync();

			deferred.resolve(storage);
		};

		if (Browser.storage.config) {
			parseData(Browser.storage.config);
		}
		else if (Browser.chromeLocal) {
			Browser.chromeLocal.get(["tabs", "settings", "themes", "cached"], function(d) {
				if (typeof d.tabs === "string") {
					try {
						d.tabs = JSON.parse(d.tabs);
					}
					catch(e) {
						delete d.tabs;
					}
				}

				Browser.storage.config = JSON.stringify(d);

				Browser.chromeLocal.remove(["tabs", "settings", "themes", "cached"]);
				Browser.syncStorage.remove(["tabs", "settings", "themes", "cached"]);

				parseData(d);
			});
		}
		else {
			parseData();
		}


		// Listen for storage changes from the background and other pages
		window.addEventListener("storage", function(e) {
			if (!e || e.key !== "config" || !e.newValue) {
				return;
			}

			var changed,
				oldData = JSON.parse(e.oldValue),
				newData = JSON.parse(e.newValue);

			_.each(newData, function(e, k) {
				// Note that this uses oldData.settings in both cases. We don't
				// want settings changed to be misinterpreted as tab changes.
				if (k === "tabs" && getJSON(oldData.tabs, oldData.settings) !== getJSON(newData.tabs, oldData.settings)) {
					changed = true;

					storage.tabs = e;
				}
				else if (["user", "themes", "settings", "cached"].indexOf(k) !== -1 && JSON.stringify(e) !== JSON.stringify(oldData[k])) {
					changed = true;

					storage[k] = e;
				}
			});

			if (!changed) {
				return;
			}

			console.log("Detected localStorage change, updating");

			storage.modified = new Date(e).getTime();

			storage.tabsSync = JSON.parse(getJSON(storage.tabs, storage.settings));

			lastSaved = JSON.stringify(_.pick(storage, "user", "tabs", "settings", "themes", "cached"));
			lastSynced = JSON.stringify(_.pick(storage, "user", "tabsSync", "settings", "themes"));

			promise.trigger("updated");
		});

		return promise;
	}
);