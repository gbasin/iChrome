/**
 * Exports a global analytics API
 */
define(function() {
	// Uncompressed Google Analytics insertion code
	(function() {
		window.GoogleAnalyticsObject = "ga";

		window.ga = window.ga || function() {
			(window.ga.q = window.ga.q || []).push(arguments);
		};

		window.ga.l = new Date().getTime();

		var script = document.createElement("script"),
			firstScript = document.getElementsByTagName("script")[0];

		script.async = true;
		script.src = "https://ssl.google-analytics.com/analytics.js";

		// Analytics are not critical, delay insertion
		requestAnimationFrame(function() {
			firstScript.parentNode.insertBefore(script,firstScript);
		});
	})();

	/* global ga */

	ga("create", "UA-41131844-4", "ichro.me"); // This is temporarily set to a blank profile since the page is reloaded hundreds of times during development.
	ga("require", "displayfeatures");

	ga("set", "checkProtocolTask", function() {}); // Fixes the incompatibility with Chrome extensions: https://code.google.com/p/analytics-issues/issues/detail?id=312#c2

	var track = function() {
		track.event.call(track, arguments);
	};

	track.ga = ga;

	/*
		This wraps the Analytics event tracker.

		Usage: Track.event("GSShare", "Twitter");
	*/
	track.event = function(category, action, label, value, nin) {
		if (nin) { // All previous parameters have been defined
			ga("send", "event", category, action, label.toString(), value, {
				"nonInteraction": 1
			});
		}
		else if (value) {
			ga("send", "event", category, action, label.toString(), value);
		}
		else if (label) {
			ga("send", "event", category, action, label.toString());
		}
		else {
			ga("send", "event", category, action);
		}
	};

	/*
		This wraps the Analytics pageview tracker.

		Usage: Track.pageview("/settings");
	*/
	track.pageview = function(title, path) {
		if (!path) {
			path = title;

			title = null;
		}

		if (path && title) {
			ga("send", "pageview", {
				page: path,
				title: title
			});
		}
		else {
			ga("send", "pageview", path || ("/v" + chrome.runtime.getManifest().version + "/newtab"));
		}
	};

	/*
		This sets a timer to the current time and returns a mark function.  It can't use named timers since they might overlap and reset each other.

		Usage: var mark = Track.time();
	*/
	track.time = function() {
		var time = new Date().getTime();

		/*
			This takes the value from a timer, subtracts it form the current time and tracks the result with the given variable and label parameters.

			It can be called multiple times as in the case of storage saving (see storage/sync.js).

			Usage: mark("Storage", "Load");
		*/
		return function(category, variable, label) {
			if (label) {
				ga("send", "timing", category, variable || "Time", new Date().getTime() - time, label);
			}
			else {
				ga("send", "timing", category, variable || "Time", new Date().getTime() - time);
			}
		};
	};


	// Track pageview with GA and internal counter
	track.pageview();
	
	localStorage.uses = parseInt(localStorage.uses || 0) + 1;

	return track;
});