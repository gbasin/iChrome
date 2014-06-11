/**
 * This loads all defined templates and returns them. This will be replaced with a precompiled JSON set of templates during build.
 */

var templates = [
		"css",					"toolbar",				"search",
		"store",				"store-detail",			"themes",
		"themes.listing",		"themes.custom",		"widget-settings",
		"getting-started",		"donate",				"updated",
		"new-tab",				"whats-new",			"settings",
		"settings/new-tab",		"settings/general",		"settings/visual",
		"settings/advanced",	"settings/tab-specific",
		
		// I plan on changing these to be dynamically read from the widget manifest later
		"widgets.weather",				"widgets.weather.desc",
		"widgets.stocks",				"widgets.stocks.desc",
		"widgets.clock",				"widgets.clock.desc",
		"widgets.news",					"widgets.news.desc",
		"widgets.rss",					"widgets.rss.desc",
		"widgets.traffic",				"widgets.traffic.desc",
		"widgets.analytics",			"widgets.analytics.desc",
		"widgets.unread",				"widgets.unread.desc",
		"widgets.iframe",				"widgets.iframe.desc",
		"widgets.calendar",				"widgets.calendar.desc",
		"widgets.apps",					"widgets.apps.desc",
		"widgets.topsites",				"widgets.topsites.desc",
		"widgets.notes",				"widgets.notes.desc",
		"widgets.wolfram",				"widgets.wolfram.desc",
		"widgets.sports",				"widgets.sports.desc",
		"widgets.bookmarks",			"widgets.bookmarks.desc",	"widgets.bookmarks.listing",
		"widgets.todo",					"widgets.todo.desc",
		"widgets.reddit",				"widgets.reddit.desc",
		"widgets.feedly",				"widgets.feedly.desc",		"widgets.feedly.articles",
		"widgets.translate",			"widgets.translate.desc",
		"widgets.currency",				"widgets.currency.desc",
		"widgets.voice",				"widgets.voice.desc",
		"widgets.keep",					"widgets.keep.desc",
		"widgets.now",					"widgets.now.desc",
		"widgets.gmail",				"widgets.gmail.desc",
		"widgets.twitter",				"widgets.twitter.desc",
		"widgets.drive",				"widgets.drive.desc",
		"widgets.calc",					"widgets.calc.desc",
		"widgets.youtube",				"widgets.youtube.desc",
		"widgets.plus",					"widgets.plus.desc",
		"widgets.facebook",				"widgets.facebook.desc",
		"widgets.recentlyclosed",		"widgets.recentlyclosed.desc"
	],
	deps = [];

templates.forEach(function(e, i) {
	deps[i] = "text!/templates/";

	if (/^widgets\.([a-z\-]*)\.(.*)$/.test(e)) {
		deps[i] += e.replace(/^widgets\.([a-z\-]*)\.(.*)$/, "widgets/$1/$2");
	}
	else if (e.indexOf("widgets.") == 0) {
		deps[i] += e.replace(/^widgets\.([a-z\-]*)$/, "widgets/$1/template");
	}
	else {
		deps[i] += e;
	}

	deps[i] += ".hjs";
});

/*
	During build this whole file will be replaced with:

	define(function() {
		return {
			raw: {}, // Raw templates will be inlined here
			compiled: {} // And precompiled ones here
		}
	});
*/
define(deps, function() {
	var raw = {};

	[].forEach.call(arguments, function(e, i) {
		raw[templates[i]] = e;
	});

	return {
		raw: raw,
		compiled: null
	};
});