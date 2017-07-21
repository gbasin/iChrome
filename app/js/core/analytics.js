/**
 * Exports a global analytics API
 */
define(["lodash", "browser/api", "core/status", "core/auth", "fbanalytics"], function(_, Browser, Status, Auth, FB) {
	var sendQueue = [],
		sendTimeout = null,
		pageTime, totalLoad, toolbarStyle;

	window.addEventListener("beforeunload", function() {
		if (sendTimeout) {
			clearTimeout(sendTimeout);
		}

		flushQueue(true);
	});

	var flushQueue = function(isFinal) {
		sendTimeout = null;

		if (isFinal) {
			sendQueue.push([
				"session",
				new Date().getTime(), // The time this event was triggered
				pageTime, // The time the page took to load and parse
				totalLoad, // The time it took for the page to completely render
				new Date().getTime() - performance.timing.responseEnd, // The total time the user spent on this page
				Status.get("error").length, // The number of errors in the log
				toolbarStyle // The style of the toolbar
			]);
		}

		navigator.sendBeacon("https://stats.ichro.me/ingest?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language, new Blob([JSON.stringify(sendQueue)], {
			type: "text/plain" // Fix for Chrome 59 which requires sendBeacon to use CORS-safe content-types
		}));

		sendQueue = [];
	};

	// GA setup
	(function() {
		// Uncompressed Google Analytics insertion code
		window.GoogleAnalyticsObject = "ga";

		window.ga = window.ga || function() {
			(window.ga.q = window.ga.q || []).push(arguments);
		};

		window.ga.l = new Date().getTime();


		var script = document.createElement("script"),
			firstScript = document.getElementsByTagName("script")[0];

		script.async = true;
		script.src = "https://www.google-analytics.com/analytics.js";

		firstScript.parentNode.insertBefore(script, firstScript);


		/* global ga */
		ga("create", "UA-41131844-4", "auto"); // This is temporarily set to a blank profile since the page is reloaded hundreds of times during development.

		ga("set", "checkProtocolTask", function() {}); // Fixes the incompatibility with Chrome extensions: https://code.google.com/p/analytics-issues/issues/detail?id=312#c2

		ga("set", "transport", "beacon");

		ga("require", "displayfeatures");

		ga("set", "dimension1", Auth.isPro ? "Pro" : Auth.adFree ? "Ad-free" : Auth.isSignedIn ? "Signed in" : "Anonymous");
	})();

	var track = function() {
		track.event.call(track, arguments);
	};

	Object.defineProperty(track, "ga", { get: function() {
		return ga;
	} });

	track.FB = FB;

	/*
		This wraps the Analytics event tracker.

		Usage: Track.event("GSShare", "Twitter");
	*/
	track.event = function(category, action, label, value, nin) {
		if (nin) { // All previous parameters have been defined
			ga("send", "event", category, action, label.toString(), value, {
				nonInteraction: 1
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
			ga("send", "pageview", path || ("/v" + Browser.app.version + (Browser.app.newTab ? "/newtab" : "")));
		}
	};

	/*
		This sets a timer to the current time and returns a mark function.  It can't use named timers since they might overlap and reset each other.

		Usage: var mark = Track.time();
	*/
	track.time = function() {
		var time = new Date().getTime();

		/*
			This takes the value from a timer, subtracts it from the current time and tracks the result with the given variable and label parameters.

			It can be called multiple times as in the case of storage saving (see storage/sync.js).

			Usage: mark("Storage", "Load");
		*/
		return function(category, variable) {
			track.queue("timing", category, variable, new Date().getTime() - time);

			ga("send", "timing", category, variable || "Time", new Date().getTime() - time);
		};
	};


	/**
	 * Called when the page is completely rendered, keeps track of load times
	 *
	 * @api     public
	 * @param   {String}  [style]  The style of the toolbar
	 */
	track.pageDone = function(style) {
		if (style) {
			toolbarStyle = style;
		}

		var cTime = new Date().getTime();

		totalLoad = cTime - performance.timing.responseEnd;

		pageTime = (performance.timing.loadEventEnd || cTime) - performance.timing.responseEnd;

		Status.log("Window load took " + pageTime + "ms, actual load took " + totalLoad + "ms");

		console.log("Window load took " + pageTime + "ms, actual load took " + totalLoad + "ms");

		ga("send", "timing", "Page", "Onload", pageTime);

		ga("send", "timing", "Page", "Complete", totalLoad);

		track.queue(
			"sessionStart",
			pageTime, // The time the page took to load and parse
			totalLoad, // The time it took for the page to completely render
			toolbarStyle // The style of the toolbar
		);
	};


	var sizes = {
		tiny: 1,
		small: 2,
		medium: 3,
		large: 4,
		variable: 5
	};

	/**
	 * Queues an item in iChrome's "native" analytics
	 *
	 * @api     public
	 */
	track.queue = function() {
		// Still need to wait for Chrome 45 to use arrow functions (e => !e)
		var params = _.dropRightWhile(arguments, function(e) { return !e; });

		// Compress the most common events
		if (params[0] === "widgets") {
			params[0] = "w";

			if (params[1] === "view") {
				params[1] = "v";
			}

			if (params[3] && sizes[params[3]]) {
				params[3] = sizes[params[3]];
			}
		}
		else if (params[0] === "timing") {
			params[0] = "t";

			if (params[1] === "Sync") {
				params[1] = "s";
			}

			if (params[2] && params[2] === "Load") {
				params[2] = "l";
			}
			else if (params[2] && params[2] === "Save") {
				params[2] = "s";
			}
		}

		sendQueue.push([].concat(params.shift(), new Date().getTime(), params));

		// A timeout is used so multiple events triggered on load are lumped into one request
		if (sendQueue.length >= 100) {
			clearTimeout(sendTimeout);

			flushQueue();
		}
		else if (!sendTimeout) {
			sendTimeout = setTimeout(flushQueue, 1000);
		}
	};


	// Track pageview with GA and internal counter
	track.pageview();

	Browser.storage.uses = parseInt(Browser.storage.uses || 0) + 1;

	return track;
});