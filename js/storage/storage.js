/**
 * Fetches storage from Chrome's chrome.storage.local and returns a deferred
 */
define(
	["jquery", "underscore", "backbone", "core/status", "core/analytics", "storage/defaults", "storage/sync", "storage/tojson"],
	function($, _, Backbone, Status, Track, defaults, sync, getJSON) {
		var deferred = $.Deferred(),
			storage = {
				Originals: {},
				sync: function() {
					sync(storage);
				}
			};

		Track.time("Storage");

		chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
			Track.mark("Storage", "Loaded");
			
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
		promise.trigger = function(name) {
			Backbone.Events.trigger.call(promise, name, storage, promise);
		};

		// Trigger the done event on done
		promise.done(function() {
			promise.trigger("done");
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
			}

			Backbone.Events.on.call(promise, events, cb, ctx);
		};

		return promise;
	}
);