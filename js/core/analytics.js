/**
 * Exports a global analytics API
 */
define(function() {
	(function(i, s, o, g, r, a, m) {
		i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
	})(window, document, "script", "https://ssl.google-analytics.com/analytics_debug.js", "ga");

	ga("create", "UA-41131844-4", "ichro.me"); // This is temporarily set to a blank profile since the page is reloaded hundreds of times during development.
	ga("require", "displayfeatures");

	ga("set", "checkProtocolTask", function() {}); // Fixes the incompatibility with Chrome extensions: https://code.google.com/p/analytics-issues/issues/detail?id=312#c2

	var timers = {},
		track = function() {
			track.event.call(track, arguments);
		};

	track.ga = ga;

	/*
		This wraps the Analytics event tracker.

		Usage: Track.event("GSShare", "Twitter");
	*/
	track.event = function(category, action, label, value, nin) {
		if (nin) { // All previous parameters have been defined
			ga("send", "event", category, action, label, value, {
				"nonInteraction": 1
			});
		}
		else if (value) {
			ga("send", "event", category, action, label, value);
		}
		else if (label) {
			ga("send", "event", category, action, label);
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

			delete title;
		}

		if (path && title) {
			ga("send", "pageview", {
				page: path,
				title: title
			});
		}
		else {
			ga("send", "pageview", path || ("/v" + chrome.runtime.getManifest().version));
		}
	};

	/*
		This sets a timer to the current time.

		Usage: Track.time("Storage");
	*/
	track.time = function(which) {
		timers[which] = new Date().getTime();
	};

	/*
		This takes the value from a timer, subtracts it form the current time and tracks the result with the given variable and label parameters.

		Usage: Track.mark("Storage", "Load");
	*/
	track.mark = function(which, variable, label) {
		if (label && timers[which]) {
			ga("send", "timing", which, variable || "Time", new Date().getTime() - timers[which], label);
		}
		else if (timers[which]) {
			ga("send", "timing", which, variable || "Time", new Date().getTime() - timers[which]);
		}

		delete timers[which];
	};

	return track;
});